import api from './api';

const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventoraToken')}` } });

const getAdminBookings = async (params = {}) => {
  const response = await api.get('/admin/bookings', { ...authConfig(), params });
  return response.data.data;
};

const getAdminBookingById = async (bookingId) => {
  const response = await api.get(`/admin/bookings/${bookingId}`, authConfig());
  return response.data.data.booking;
};

const updateAdminBookingStatus = async (bookingId, status, reason) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status, reason }, authConfig());
  return response.data.data.booking;
};

const approveAdminBooking = async (bookingId) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/approve`, {}, authConfig());
  return response.data.data.booking;
};

const rejectAdminBooking = async (bookingId, reason) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/reject`, { reason }, authConfig());
  return response.data.data.booking;
};

const markCashBookingPaid = async (bookingId) => {
  const response = await api.patch(`/admin/bookings/${bookingId}/mark-paid`, {}, authConfig());
  return response.data.data.booking;
};

export { approveAdminBooking, getAdminBookingById, getAdminBookings, markCashBookingPaid, rejectAdminBooking, updateAdminBookingStatus };
