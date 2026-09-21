import ApiError from '../utils/ApiError.js';

const validateProfileUpdate = (request, response, next) => {
  const { name, phone, address } = request.body;
  const details = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80)) {
    details.push('Name must contain between 2 and 80 characters.');
  }

  if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length > 30)) {
    details.push('Phone must contain no more than 30 characters.');
  }

  if (address !== undefined && (typeof address !== 'string' || address.trim().length > 300)) {
    details.push('Address must contain no more than 300 characters.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'Profile data is invalid.', details));
  }

  next();
};

const validateChangePassword = (request, response, next) => {
  const { currentPassword, newPassword } = request.body;
  const details = [];

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
    details.push('Current password is required.');
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    details.push('New password must contain at least 8 characters.');
  }

  if (currentPassword === newPassword) {
    details.push('New password must be different from the current password.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'Password data is invalid.', details));
  }

  next();
};

export { validateChangePassword, validateProfileUpdate };