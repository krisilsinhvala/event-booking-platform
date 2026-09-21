import ApiError from '../utils/ApiError.js';

const authorize = (...allowedRoles) => (request, response, next) => {
  if (!request.user || !allowedRoles.includes(request.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource.'));
  }

  next();
};

export default authorize;