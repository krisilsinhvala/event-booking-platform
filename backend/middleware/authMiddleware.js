import jwt from 'jsonwebtoken';
import { environment } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const authenticate = async (request, response, next) => {
  const authorizationHeader = request.headers.authorization;
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication is required.'));
  }

  if (!environment.jwtSecret) {
    return next(new ApiError(500, 'JWT authentication is not configured.'));
  }

  try {
    const decodedToken = jwt.verify(token, environment.jwtSecret);
    const user = await User.findById(decodedToken.sub);

    if (!user) {
      return next(new ApiError(401, 'The authenticated user no longer exists.'));
    }

    request.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your session has expired. Please log in again.'));
    }

    return next(new ApiError(401, 'The authentication token is invalid.'));
  }
};

export default authenticate;