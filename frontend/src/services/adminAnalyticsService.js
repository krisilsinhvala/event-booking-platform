import api from './api';

const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

export default getAdminDashboard;