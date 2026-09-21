import mongoose from 'mongoose';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAdminEvents = asyncHandler(async (request, response) => {
  const events = await Event.find().sort({ createdAt: -1 }).lean();
  response.status(200).json({ success: true, message: 'Admin events retrieved successfully.', data: { events } });
});

const createEvent = asyncHandler(async (request, response) => {
  const {
    category, date, description, image, isPublished, location, ticketPrice, time, title, totalSeats, venue
  } = request.body;
  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    date,
    time: time.trim(),
    venue: venue.trim(),
    location: location.trim(),
    image: request.file ? `/uploads/events/${request.file.filename}` : image?.trim(),
    ticketPrice: Number(ticketPrice),
    totalSeats: Number(totalSeats),
    availableSeats: Number(totalSeats),
    createdBy: request.user._id,
    isPublished: isPublished === true || isPublished === 'true'
  });

  response.status(201).json({ success: true, message: 'Event created successfully.', data: { event } });
});

const updateEvent = asyncHandler(async (request, response) => {
  const { eventId } = request.params;
  if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, 'Event ID is invalid.');
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found.');

  const reservedSeats = event.totalSeats - event.availableSeats;
  const nextTotalSeats = Number(request.body.totalSeats);
  if (nextTotalSeats < reservedSeats) throw new ApiError(400, `Total seats cannot be lower than the ${reservedSeats} already reserved.`);

  event.title = request.body.title.trim();
  event.description = request.body.description.trim();
  event.category = request.body.category.trim();
  event.date = request.body.date;
  event.time = request.body.time.trim();
  event.venue = request.body.venue.trim();
  event.location = request.body.location.trim();
  event.ticketPrice = Number(request.body.ticketPrice);
  event.totalSeats = nextTotalSeats;
  event.availableSeats = nextTotalSeats - reservedSeats;
  if (request.file) event.image = `/uploads/events/${request.file.filename}`;
  else if (request.body.image !== undefined) event.image = request.body.image.trim();
  if (request.body.isPublished !== undefined) event.isPublished = request.body.isPublished === true || request.body.isPublished === 'true';
  await event.save();

  response.status(200).json({ success: true, message: 'Event updated successfully.', data: { event } });
});

const deleteEvent = asyncHandler(async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.eventId)) throw new ApiError(400, 'Event ID is invalid.');
  const event = await Event.findByIdAndDelete(request.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found.');
  response.status(200).json({ success: true, message: 'Event deleted successfully.', data: null });
});

const toggleEventPublishing = asyncHandler(async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.eventId)) throw new ApiError(400, 'Event ID is invalid.');
  const event = await Event.findById(request.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found.');
  event.isPublished = !event.isPublished;
  await event.save();
  response.status(200).json({ success: true, message: event.isPublished ? 'Event published.' : 'Event unpublished.', data: { event } });
});

export { createEvent, deleteEvent, getAdminEvents, toggleEventPublishing, updateEvent };