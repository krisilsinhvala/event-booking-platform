import ApiError from '../utils/ApiError.js';

const validateEvent = (request, response, next) => {
  const { category, date, description, location, ticketPrice, time, title, totalSeats, venue } = request.body;
  const details = [];

  if (!title?.trim() || title.trim().length > 160) details.push('Title is required and must be 160 characters or fewer.');
  if (!description?.trim() || description.trim().length > 5000) details.push('Description is required and must be 5000 characters or fewer.');
  if (!category?.trim()) details.push('Category is required.');
  if (!date || Number.isNaN(new Date(date).getTime())) details.push('A valid event date is required.');
  if (!time?.trim()) details.push('Event time is required.');
  if (!venue?.trim()) details.push('Venue is required.');
  if (!location?.trim()) details.push('Location is required.');
  if (Number.isNaN(Number(ticketPrice)) || Number(ticketPrice) < 0) details.push('Ticket price must be zero or greater.');
  if (!Number.isInteger(Number(totalSeats)) || Number(totalSeats) < 1) details.push('Total seats must be a positive whole number.');

  if (details.length > 0) return next(new ApiError(400, 'Event data is invalid.', details));
  next();
};

export { validateEvent };