import api from './api';

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('eventoraToken')}` }
});

const createBooking = async (eventId, numberOfTickets, paymentMethod) => {
  const response = await api.post(`/bookings/events/${eventId}`, { numberOfTickets, paymentMethod }, authConfig());
  return response.data.data;
};

const createPaymentOrder = async (bookingId) => {
  const response = await api.post('/payments/create-order', { bookingId }, authConfig());
  return response.data.data;
};

const verifyPayment = async (payload) => {
  const response = await api.post('/payments/verify', payload, authConfig());
  return response.data.data;
};

const verifyBooking = async (bookingId, otp) => {
  const response = await api.post(`/bookings/${bookingId}/verify`, { otp }, authConfig());
  return response.data.data;
};

const resendBookingOtp = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/resend-otp`, {}, authConfig());
  return response.data;
};

const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings', authConfig());
  return response.data.data.bookings;
};

const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`, authConfig());
  return response.data.data.booking;
};

const cancelBooking = async (bookingId, reason) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason }, authConfig());
  return response.data.data.booking;
};

export { cancelBooking, createBooking, createPaymentOrder, getBookingById, getMyBookings, resendBookingOtp, verifyBooking, verifyPayment };
