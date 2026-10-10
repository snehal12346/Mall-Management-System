/**
 * Centralized Error Handling Middleware
 * Converts PostgreSQL errors and operational exceptions into user-friendly JSON
 */

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL Error Codes Mapping
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique Violation
        return res.status(409).json({
          success: false,
          error: 'UniqueConstraintError',
          message: err.detail || 'A record with these details already exists.',
          detail: err.detail,
        });

      case '23503': // Foreign Key Violation
        return res.status(400).json({
          success: false,
          error: 'ForeignKeyError',
          message: err.detail || 'Referenced record does not exist or cannot be deleted due to existing references.',
          detail: err.detail,
        });

      case '23514': // Check Constraint Violation
        return res.status(400).json({
          success: false,
          error: 'CheckConstraintError',
          message: `Validation failed: Condition '${err.constraint}' violated.`,
          constraint: err.constraint,
        });

      case '22P02': // Invalid Text Representation (e.g., passing string for integer)
        return res.status(400).json({
          success: false,
          error: 'InvalidDataFormat',
          message: 'Invalid data format provided for one or more fields.',
        });

      case 'P0001': // Custom PL/pgSQL RAISE EXCEPTION (from Triggers / Procedures)
        return res.status(400).json({
          success: false,
          error: 'BusinessRuleViolation',
          message: err.message || 'Operation violated mall management business rule.',
        });

      default:
        break;
    }
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected internal error occurred on the server.',
  });
};

module.exports = errorHandler;
