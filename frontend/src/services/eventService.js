import api from './api';

const getEvents = async (params = {}, signal) => {
  const response = await api.get('/events', { params, signal });
  return response.data.data;
};

const getEventById = async (eventId, signal) => {
  const response = await api.get(`/events/${eventId}`, { signal });
  return response.data.data.event;
};

export { getEventById, getEvents };
