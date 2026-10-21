/**
 * Centralized Global Error Handler Middleware
 * Standardizes API error responses and protects sensitive database/internal details in production
 */
function errorHandler(err, req, res, next) {
  // Safe server-side error logging (never expose database connection strings or secrets)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.error('[API Error]:', err.stack || err.message || err);
  } else {
    console.error('[API Error]:', err.message || 'Internal error');
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Database Error Codes safely
  if (err.code === 'P2023') {
    // Malformed ObjectID / UUID format error
    statusCode = 400;
    message = 'Invalid ID or query parameter format provided.';
  } else if (err.code === 'P2025') {
    // Record not found
    statusCode = 404;
    message = 'The requested resource was not found.';
  } else if (err.code === 'P2002') {
    // Unique constraint violation
    statusCode = 409;
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `A resource with this ${target} already exists.`;
  } else if (err.code === 'P2003') {
    // Foreign key constraint failure
    statusCode = 400;
    message = 'Invalid reference identifier provided.';
  } else if (statusCode === 500 && !isDev) {
    // Mask raw internal 500 database/driver errors in production
    message = 'An unexpected server error occurred. Please try again later.';
  }

  // Dual-format response for universal client compatibility
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      message,
      ...(isDev && { stack: err.stack }),
    },
  });
}

/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    error: {
      message: `Route not found - ${req.originalUrl}`,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
