const notFoundMiddleware = (request, response) => {
  response.status(404).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    details: [],
    data: null
  });
};

const errorMiddleware = (error, request, response, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message;
  let details = error.details || [];

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Request data is invalid.';
    details = Object.values(error.errors).map((validationError) => validationError.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with one of these values already exists.';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'One of the supplied identifiers is invalid.';
  }

  if (error.name === 'MulterError') {
    statusCode = 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Uploaded image must be 5 MB or smaller.' : 'The image upload could not be processed.';
  }

  if (statusCode === 500) {
    message = 'An unexpected server error occurred.';
    details = [];
  }

  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, error);
  }

  response.status(statusCode).json({
    success: false,
    message,
    details,
    data: null
  });
};

export { errorMiddleware, notFoundMiddleware };