const env = require('../config/env');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

function validateResumeFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file uploaded');
    return { isValid: false, errors };
  }

  const originalName = file.originalname || '';
  const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

  // Validate extension and MIME type
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(extension);

  if (!isMimeAllowed && !isExtAllowed) {
    errors.push('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.');
  }

  // Validate size limit
  const maxBytes = env.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    errors.push(`Resume file must be smaller than ${env.maxFileSizeMb} MB.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    extension,
  };
}

module.exports = {
  validateResumeFile,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
