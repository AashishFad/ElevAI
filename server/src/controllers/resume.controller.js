const { getPrismaClient } = require('../config/database');
const { validateResumeFile } = require('../validators/resume.validator');
const { uploadResumeFile, deleteResumeFile, getSignedDownloadUrl } = require('../services/storageService');
const { parseResumeBuffer } = require('../services/resumeParserService');

async function uploadResume(req, res, next) {
  let initialResume = null;
  const prisma = getPrismaClient();

  try {
    const file = req.file;
    const { isValid, errors } = validateResumeFile(file);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const userId = req.user.userId;

    // 1. Create initial Resume database record in UPLOADING status
    initialResume = await prisma.resume.create({
      data: {
        userId,
        originalFileName: file.originalname,
        storagePath: 'pending',
        fileType: file.mimetype,
        fileSize: file.size,
        status: 'UPLOADING',
      },
    });

    // 2. Upload file buffer to Supabase Storage
    let storagePath = `local-storage/${userId}/${initialResume.id}/${file.originalname}`;
    try {
      storagePath = await uploadResumeFile({
        userId,
        resumeId: initialResume.id,
        fileName: file.originalname,
        fileBuffer: file.buffer,
        mimeType: file.mimetype,
      });
    } catch (storageErr) {
      console.warn('[Storage Notice] Supabase storage upload notice:', storageErr.message);
      // Fallback path if Supabase credentials are pending in dev
    }

    // Update status to PROCESSING and set final storagePath
    await prisma.resume.update({
      where: { id: initialResume.id },
      data: {
        storagePath,
        status: 'PROCESSING',
      },
    });

    // 3. Extract text from PDF/DOCX
    let extractedText = '';
    try {
      extractedText = await parseResumeBuffer(file.buffer, file.mimetype, file.originalname);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No readable text could be extracted from this document.');
      }

      // Mark as READY
      const updatedResume = await prisma.resume.update({
        where: { id: initialResume.id },
        data: {
          status: 'READY',
          extractedText,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        resume: {
          id: updatedResume.id,
          originalFileName: updatedResume.originalFileName,
          fileType: updatedResume.fileType,
          fileSize: updatedResume.fileSize,
          status: updatedResume.status,
          createdAt: updatedResume.createdAt,
        },
      });
    } catch (parseErr) {
      // Mark as FAILED if text extraction fails
      const failedResume = await prisma.resume.update({
        where: { id: initialResume.id },
        data: {
          status: 'FAILED',
          errorMessage: parseErr.message,
        },
      });

      return res.status(422).json({
        success: false,
        message: `Resume upload saved, but text parsing failed: ${parseErr.message}`,
        resume: {
          id: failedResume.id,
          originalFileName: failedResume.originalFileName,
          status: failedResume.status,
          errorMessage: failedResume.errorMessage,
        },
      });
    }
  } catch (error) {
    if (initialResume) {
      await prisma.resume.update({
        where: { id: initialResume.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      }).catch(() => {});
    }
    next(error);
  }
}

async function getResumes(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        originalFileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            applications: true,
            analyses: true,
            improvements: true,
            jobOptimizations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    next(error);
  }
}

async function getResumeById(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            applications: true,
            analyses: true,
            improvements: true,
            jobOptimizations: true,
          },
        },
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied',
      });
    }

    // Safety guard: Prevent deletion if resume is attached to submitted applications
    const activeApplicationsCount = await prisma.application.count({
      where: { resumeId: resume.id },
    });

    if (activeApplicationsCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete this resume because it is linked to ${activeApplicationsCount} submitted job application(s). Your application history must be preserved.`,
        applicationCount: activeApplicationsCount,
      });
    }

    // Delete file from Supabase Storage
    await deleteResumeFile(resume.storagePath);

    // Delete Prisma record
    await prisma.resume.delete({
      where: { id: resume.id },
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

async function getResumeDownloadUrl(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied',
      });
    }

    let downloadUrl = '#';
    try {
      downloadUrl = await getSignedDownloadUrl(resume.storagePath, 3600);
    } catch (storageErr) {
      return res.status(400).json({
        success: false,
        message: `Signed URL generation unavailable: ${storageErr.message}`,
      });
    }

    res.status(200).json({
      success: true,
      downloadUrl,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  getResumeDownloadUrl,
};
