import api from './api';

const authConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('eventoraToken')}` } });

const getAdminEvents = async () => {
  const response = await api.get('/admin/events', authConfig());
  return response.data.data.events;
};

const saveAdminEvent = async (eventId, formData) => {
  const endpoint = eventId ? `/admin/events/${eventId}` : '/admin/events';
  const response = eventId
    ? await api.put(endpoint, formData, authConfig())
    : await api.post(endpoint, formData, authConfig());
  return response.data.data.event;
};

const deleteAdminEvent = async (eventId) => {
  const response = await api.delete(`/admin/events/${eventId}`, authConfig());
  return response.data;
};

const toggleAdminEvent = async (eventId) => {
  const response = await api.patch(`/admin/events/${eventId}/publish`, {}, authConfig());
  return response.data.data.event;
};

export { deleteAdminEvent, getAdminEvents, saveAdminEvent, toggleAdminEvent };
