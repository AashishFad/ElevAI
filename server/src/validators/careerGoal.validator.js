const VALID_EXPERIENCE_LEVELS = [
  'FRESHER',
  'ONE_TO_TWO_YEARS',
  'THREE_TO_FIVE_YEARS',
  'EXPERIENCED',
];

function validateCareerGoalInput({ targetRole, experienceLevel }) {
  const errors = [];

  if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length === 0) {
    errors.push('Target career role is required');
  }

  if (!experienceLevel || !VALID_EXPERIENCE_LEVELS.includes(experienceLevel)) {
    errors.push(`Invalid experience level. Must be one of: ${VALID_EXPERIENCE_LEVELS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      targetRole: targetRole ? targetRole.trim() : '',
      experienceLevel,
    },
  };
}

module.exports = {
  validateCareerGoalInput,
  VALID_EXPERIENCE_LEVELS,
};
