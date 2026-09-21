import ApiError from '../utils/ApiError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (request, response, next) => {
  const { name, email, password } = request.body;
  const details = [];

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    details.push('Name must contain between 2 and 80 characters.');
  }

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    details.push('A valid email address is required.');
  }

  if (typeof password !== 'string' || password.length < 8) {
    details.push('Password must contain at least 8 characters.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'Registration data is invalid.', details));
  }

  next();
};

const validateLogin = (request, response, next) => {
  const { email, password } = request.body;
  const details = [];

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    details.push('A valid email address is required.');
  }

  if (typeof password !== 'string' || password.length === 0) {
    details.push('Password is required.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'Login data is invalid.', details));
  }

  next();
};

const validateEmailOtp = (request, response, next) => {
  const { email, otp } = request.body;
  const details = [];

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    details.push('A valid email address is required.');
  }

  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    details.push('OTP must contain exactly 6 digits.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'OTP data is invalid.', details));
  }

  next();
};

const validateEmailOnly = (request, response, next) => {
  if (typeof request.body.email !== 'string' || !emailPattern.test(request.body.email.trim())) {
    return next(new ApiError(400, 'A valid email address is required.'));
  }

  next();
};

const validateResetPassword = (request, response, next) => {
  const { email, otp, password } = request.body;
  const details = [];

  if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
    details.push('A valid email address is required.');
  }

  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    details.push('OTP must contain exactly 6 digits.');
  }

  if (typeof password !== 'string' || password.length < 8) {
    details.push('Password must contain at least 8 characters.');
  }

  if (details.length > 0) {
    return next(new ApiError(400, 'Password reset data is invalid.', details));
  }

  next();
};

const validateGoogleAuth = (request, response, next) => {
  const token = request.body.idToken || request.body.credential;

  if (typeof token !== 'string' || !token.trim()) {
    return next(new ApiError(400, 'A valid Google credential or ID token is required.'));
  }

  request.body.idToken = token.trim();
  next();
};

export {
  validateEmailOnly,
  validateEmailOtp,
  validateGoogleAuth,
  validateLogin,
  validateRegister,
  validateResetPassword
};