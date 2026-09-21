import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';

const reserveEventSeats = async (eventId, numberOfTickets) => {
  const existingEvent = await Event.findById(eventId);
  if (!existingEvent || !existingEvent.isPublished) {
    throw new ApiError(404, 'Event not found or not available.');
  }

  if (existingEvent.availableSeats < numberOfTickets) {
    throw new ApiError(409, 'Not enough available seats for this event.');
  }

  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      isPublished: true,
      availableSeats: { $gte: numberOfTickets }
    },
    { $inc: { availableSeats: -numberOfTickets } },
    { new: true }
  );

  if (!event) {
    throw new ApiError(409, 'The event does not have enough available seats.');
  }

  return event;
};

const releaseEventSeats = async (eventId, numberOfTickets) => {
  await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: numberOfTickets } });
};

export { releaseEventSeats, reserveEventSeats };