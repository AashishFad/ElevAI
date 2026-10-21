/**
 * Parameter validation middleware for UUID format checks
 * Prevents invalid/malformed IDs from causing unhandled database exceptions
 */

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isValidUUID(val) {
  if (!val || typeof val !== 'string') return false;
  return UUID_REGEX.test(val.trim());
}

/**
 * Validate that specific named route parameters match UUID format
 * @param  {...string} paramNames - e.g. 'id', 'jobId', 'resumeId', 'applicationId'
 */
function validateUUIDParams(...paramNames) {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const val = req.params[paramName];
      if (val !== undefined && !isValidUUID(val)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ID format for parameter '${paramName}'. Must be a valid UUID.`,
        });
      }
    }
    next();
  };
}

module.exports = {
  isValidUUID,
  validateUUIDParams,
};
