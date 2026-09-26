/**
 * Central Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[SightAssist Server Error]', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
