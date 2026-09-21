import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';

const reserveEventSeats = async (eventId, numberOfTickets) => {
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      isPublished: true,
      date: { $gt: new Date() },
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