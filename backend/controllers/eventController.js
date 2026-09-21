import mongoose from 'mongoose';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { checkAndGenerateEvents } from '../services/eventAutoGenerator.js';

const getDateRange = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const start = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    throw new ApiError(400, 'Date filter must use the YYYY-MM-DD format.');
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { $gte: start, $lt: end };
};

const getEvents = asyncHandler(async (request, response) => {
  // Fire-and-forget: check if new events need to be generated.
  // Cooldown inside the service prevents repeated DB hits.
  checkAndGenerateEvents().catch(() => {});
  const {
    category,
    date,
    limit = 12,
    maxPrice,
    minPrice,
    page = 1,
    search,
    sort = 'date_asc'
  } = request.query;
  const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 48);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const filter = { isPublished: true };

  if (category?.trim()) {
    filter.category = category.trim();
  }

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  const dateRange = getDateRange(date);
  if (dateRange) {
    filter.date = dateRange;
  }

  if (minPrice || maxPrice) {
    filter.ticketPrice = {};
    if (minPrice) filter.ticketPrice.$gte = Math.max(Number(minPrice), 0);
    if (maxPrice) filter.ticketPrice.$lte = Math.max(Number(maxPrice), 0);
  }

  const sortOptions = {
    date_asc: { date: 1, createdAt: -1 },
    date_desc: { date: -1 },
    price_asc: { ticketPrice: 1, date: 1 },
    price_desc: { ticketPrice: -1, date: 1 }
  };
  const selectedSort = sortOptions[sort] || sortOptions.date_asc;
  const [events, totalEvents] = await Promise.all([
    Event.find(filter)
      .sort(selectedSort)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .lean(),
    Event.countDocuments(filter)
  ]);

  response.status(200).json({
    success: true,
    message: 'Events retrieved successfully.',
    data: {
      events,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalEvents,
        totalPages: Math.ceil(totalEvents / parsedLimit)
      }
    }
  });
});

const getEventById = asyncHandler(async (request, response) => {
  const { eventId } = request.params;

  if (!mongoose.isValidObjectId(eventId)) {
    throw new ApiError(400, 'Event ID is invalid.');
  }

  const event = await Event.findOne({ _id: eventId, isPublished: true }).lean();

  if (!event) {
    throw new ApiError(404, 'Event not found.');
  }

  response.status(200).json({
    success: true,
    message: 'Event retrieved successfully.',
    data: { event }
  });
});

export { getEventById, getEvents };