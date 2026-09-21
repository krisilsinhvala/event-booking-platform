import api from './api';

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

const register = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};

const verifyEmail = async (payload) => {
  const response = await api.post('/auth/verify-email', payload);
  return response.data;
};

const resendEmailOtp = async (payload) => {
  const response = await api.post('/auth/resend-email-otp', payload);
  return response.data;
};

const googleLogin = async (idToken) => {
  const response = await api.post('/auth/google', { idToken });
  return response.data.data;
};

export {
  forgotPassword,
  googleLogin,
  login,
  register,
  resendEmailOtp,
  resetPassword,
  verifyEmail
};
