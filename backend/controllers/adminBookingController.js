import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { releaseEventSeats } from '../services/bookingService.js';
import {
  sendBookingConfirmationEmail,
  sendBookingRejectionEmail
} from '../services/emailService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const bookingPopulate = [
  { path: 'user', select: 'name email' },
  { path: 'event', select: 'title date time venue location ticketPrice' }
];

const getAdminBookings = asyncHandler(async (request, response) => {
  const { eventId, page = 1, limit = 20, search, status, paymentMethod, paymentStatus } = request.query;
  const filter = {};
  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  if (status && ['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
    filter.status = status;
  }

  if (paymentMethod && ['online', 'cash'].includes(paymentMethod)) filter.paymentMethod = paymentMethod;
  if (paymentStatus && ['pending', 'paid', 'failed'].includes(paymentStatus)) filter.paymentStatus = paymentStatus;

  if (eventId) {
    if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, 'Event ID is invalid.');
    filter.event = eventId;
  }

  if (search?.trim()) {
    const users = await mongoose.model('User').find({
      $or: [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ]
    }).select('_id');
    filter.user = { $in: users.map((user) => user._id) };
  }

  const [bookings, totalBookings] = await Promise.all([
    Booking.find(filter)
      .populate(bookingPopulate)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit),
    Booking.countDocuments(filter)
  ]);

  response.status(200).json({
    success: true,
    message: 'Admin bookings retrieved successfully.',
    data: {
      bookings,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalBookings,
        totalPages: Math.ceil(totalBookings / parsedLimit)
      }
    }
  });
});

const getAdminBookingById = asyncHandler(async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.bookingId)) throw new ApiError(400, 'Booking ID is invalid.');
  const booking = await Booking.findById(request.params.bookingId).populate(bookingPopulate);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  response.status(200).json({ success: true, message: 'Admin booking retrieved successfully.', data: { booking } });
});

const markCashBookingPaid = asyncHandler(async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.bookingId)) throw new ApiError(400, 'Booking ID is invalid.');

  const booking = await Booking.findOneAndUpdate(
    {
      _id: request.params.bookingId,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      seatsReserved: true
    },
    [{
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentAmount: '$totalAmount',
        paidAt: new Date(),
        processedBy: request.user._id,
        processedAt: new Date(),
        verifiedAt: new Date()
      }
    }],
    { new: true }
  ).populate(bookingPopulate);

  if (!booking) throw new ApiError(409, 'This booking is not a pending cash payment.');

  let emailDelivered = true;
  try {
    await sendBookingConfirmationEmail({ email: booking.user.email, booking });
  } catch (error) {
    emailDelivered = false;
    console.error(`Cash payment confirmation email failed: ${error.message}`);
  }

  response.status(200).json({
    success: true,
    message: emailDelivered ? 'Cash payment marked as paid.' : 'Cash payment marked as paid, but notification email failed.',
    data: { booking }
  });
});

const updateBookingStatus = asyncHandler(async (request, response) => {
  const { status, reason } = request.body;
  const allowedStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];
  if (!allowedStatuses.includes(status)) throw new ApiError(400, 'Booking status is invalid.');
  if (!mongoose.isValidObjectId(request.params.bookingId)) throw new ApiError(400, 'Booking ID is invalid.');

  const booking = await Booking.findById(request.params.bookingId).populate(bookingPopulate);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.status === status) {
    return response.status(200).json({ success: true, message: 'Booking already has this status.', data: { booking } });
  }
  if (['rejected', 'cancelled'].includes(booking.status)) throw new ApiError(409, 'A rejected or cancelled booking cannot be reopened.');
  if (status === 'confirmed' && !booking.seatsReserved) throw new ApiError(409, 'This booking no longer has reserved seats.');
  if (status === 'confirmed' && booking.paymentMethod === 'online' && booking.paymentStatus !== 'paid') {
    throw new ApiError(409, 'Online payment must be completed before confirming this booking.');
  }
  if (status === 'confirmed' && booking.paymentMethod === 'cash' && booking.paymentStatus !== 'paid') {
    throw new ApiError(409, 'Use Mark as Paid to confirm a pending cash payment.');
  }

  const releasesSeats = booking.seatsReserved && ['rejected', 'cancelled'].includes(status);
  booking.status = status;
  booking.processedBy = request.user._id;
  booking.processedAt = new Date();
  if (releasesSeats) {
    booking.seatsReserved = false;
    booking.cancellationReason = reason?.trim() || undefined;
  }
  await booking.save();
  if (releasesSeats) await releaseEventSeats(booking.event._id, booking.numberOfTickets);

  let emailDelivered = true;
  try {
    if (status === 'confirmed') await sendBookingConfirmationEmail({ email: booking.user.email, booking });
    if (status === 'rejected') await sendBookingRejectionEmail({ email: booking.user.email, booking, reason });
  } catch (error) {
    emailDelivered = false;
    console.error(`Booking status email failed: ${error.message}`);
  }

  response.status(200).json({
    success: true,
    message: emailDelivered ? `Booking marked as ${status}.` : `Booking marked as ${status}, but notification email failed.`,
    data: { booking }
  });
});

const approveBooking = (request, response, next) => {
  request.body.status = 'confirmed';
  next();
};

const rejectBooking = (request, response, next) => {
  request.body.status = 'rejected';
  next();
};

export { approveBooking, getAdminBookingById, getAdminBookings, markCashBookingPaid, rejectBooking, updateBookingStatus };