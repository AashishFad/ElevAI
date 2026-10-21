const { getPrismaClient } = require('../config/database');
const { validateCareerGoalInput } = require('../validators/careerGoal.validator');

async function getCareerGoal(req, res, next) {
  try {
    const prisma = getPrismaClient();

    const careerGoal = await prisma.careerGoal.findUnique({
      where: { userId: req.user.userId },
    });

    if (!careerGoal) {
      return res.status(200).json({
        success: true,
        careerGoal: null,
        message: 'No active career goal found',
      });
    }

    res.status(200).json({
      success: true,
      careerGoal: {
        id: careerGoal.id,
        targetRole: careerGoal.targetRole,
        experienceLevel: careerGoal.experienceLevel,
        createdAt: careerGoal.createdAt,
        updatedAt: careerGoal.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createCareerGoal(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateCareerGoalInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { targetRole, experienceLevel } = sanitized;
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    // Upsert career goal so one active goal is maintained per user
    const careerGoal = await prisma.careerGoal.upsert({
      where: { userId },
      update: {
        targetRole,
        experienceLevel,
      },
      create: {
        userId,
        targetRole,
        experienceLevel,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Career goal saved successfully',
      careerGoal: {
        id: careerGoal.id,
        targetRole: careerGoal.targetRole,
        experienceLevel: careerGoal.experienceLevel,
        createdAt: careerGoal.createdAt,
        updatedAt: careerGoal.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateCareerGoal(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateCareerGoalInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
      });
    }

    const { targetRole, experienceLevel } = sanitized;
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const existing = await prisma.careerGoal.findUnique({
      where: { userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'No career goal found to update. Please create one first.',
      });
    }

    const updated = await prisma.careerGoal.update({
      where: { userId },
      data: {
        targetRole,
        experienceLevel,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Career goal updated successfully',
      careerGoal: {
        id: updated.id,
        targetRole: updated.targetRole,
        experienceLevel: updated.experienceLevel,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCareerGoal(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.userId;

    const existing = await prisma.careerGoal.findUnique({
      where: { userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'No active career goal to delete',
      });
    }

    await prisma.careerGoal.delete({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      message: 'Career goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCareerGoal,
  createCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
};
