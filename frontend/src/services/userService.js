import api from './api';

const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventoraToken')}` } });

const getProfile = async () => {
  const response = await api.get('/users/profile', authConfig());
  return response.data.data.user;
};

const updateProfile = async (profile) => {
  const response = await api.put('/users/profile', profile, authConfig());
  return response.data.data.user;
};

const changePassword = async (passwords) => {
  const response = await api.put('/users/change-password', passwords, authConfig());
  return response.data;
};

export { changePassword, getProfile, updateProfile };
