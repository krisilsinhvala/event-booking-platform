import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { sendBookingConfirmationEmail, sendCashBookingEmail, sendOtpEmail } from '../services/emailService.js';
import { releaseEventSeats, reserveEventSeats } from '../services/bookingService.js';
import {
  compareOtp,
  generateOtp,
  getOtpExpiry,
  hashOtp,
  isOtpExpired,
  assertResendAllowed
} from '../services/otpService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const createBooking = asyncHandler(async (request, response) => {
  const { eventId } = request.params;
  const { numberOfTickets, paymentMethod = 'cash' } = request.body;
  const event = await reserveEventSeats(eventId, numberOfTickets);

  let booking;

  try {
    booking = await Booking.create({
      user: request.user._id,
      event: event._id,
      numberOfTickets,
      totalAmount: Number((event.ticketPrice * numberOfTickets).toFixed(2)),
      paymentMethod,
      paymentStatus: 'pending',
      paymentAmount: Number((event.ticketPrice * numberOfTickets).toFixed(2)),
      seatsReserved: true
    });

  } catch (error) {
    await releaseEventSeats(event._id, numberOfTickets);
    throw error;
  }

  const populatedBooking = await booking.populate('event', 'title date time venue location');
  let emailDelivered = true;
  if (paymentMethod === 'cash') {
    try {
      await sendCashBookingEmail({ email: request.user.email, booking: populatedBooking });
    } catch (error) {
      emailDelivered = false;
      console.error(`Cash booking email failed: ${error.message}`);
    }
  }

  response.status(201).json({
    success: true,
    message: paymentMethod === 'cash'
      ? emailDelivered ? 'Cash booking created successfully.' : 'Cash booking created, but the notification email could not be delivered.'
      : 'Online booking created. Complete the payment to confirm it.',
    data: { booking: populatedBooking }
  });
});

const verifyBooking = asyncHandler(async (request, response) => {
  const { bookingId } = request.params;
  const booking = await Booking.findOne({ _id: bookingId, user: request.user._id, status: 'pending' }).select(
    '+bookingOtpHash +bookingOtpExpiry'
  ).populate('event', 'title date time venue location ticketPrice');

  if (!booking || !booking.bookingOtpHash || isOtpExpired(booking.bookingOtpExpiry)) {
    throw new ApiError(400, 'The booking code is invalid or expired.');
  }

  if (!(await compareOtp(request.body.otp, booking.bookingOtpHash))) {
    throw new ApiError(400, 'The booking code is invalid or expired.');
  }

  booking.status = 'confirmed';
  booking.verifiedAt = new Date();
  booking.bookingOtpHash = undefined;
  booking.bookingOtpExpiry = undefined;
  booking.bookingOtpSentAt = undefined;
  await booking.save();
  let emailDelivered = true;
  try {
    await sendBookingConfirmationEmail({ email: request.user.email, booking });
  } catch (error) {
    emailDelivered = false;
    console.error(`Booking confirmation email failed: ${error.message}`);
  }

  response.status(200).json({
    success: true,
    message: emailDelivered
      ? 'Booking confirmed successfully.'
      : 'Booking confirmed, but the confirmation email could not be delivered.',
    data: { booking }
  });
});

const resendBookingOtp = asyncHandler(async (request, response) => {
  const booking = await Booking.findOne({ _id: request.params.bookingId, user: request.user._id, status: 'pending' }).select(
    '+bookingOtpSentAt'
  );

  if (!booking) {
    throw new ApiError(404, 'Pending booking not found.');
  }

  assertResendAllowed(booking.bookingOtpSentAt);
  const otp = generateOtp();
  booking.bookingOtpHash = await hashOtp(otp);
  booking.bookingOtpExpiry = getOtpExpiry();
  booking.bookingOtpSentAt = new Date();
  await booking.save();
  await sendOtpEmail({ email: request.user.email, otp, purpose: 'booking-verification' });

  response.status(200).json({ success: true, message: 'A new booking code has been sent.', data: null });
});

const getMyBookings = asyncHandler(async (request, response) => {
  const bookings = await Booking.find({ user: request.user._id })
    .populate('event', 'title date time venue location image ticketPrice')
    .sort({ createdAt: -1 });

  response.status(200).json({ success: true, message: 'Bookings retrieved successfully.', data: { bookings } });
});

const getBookingById = asyncHandler(async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.bookingId)) {
    throw new ApiError(400, 'Booking ID is invalid.');
  }

  const booking = await Booking.findOne({ _id: request.params.bookingId, user: request.user._id })
    .populate('event', 'title description date time venue location image ticketPrice');

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  response.status(200).json({ success: true, message: 'Booking retrieved successfully.', data: { booking } });
});

const cancelBooking = asyncHandler(async (request, response) => {
  const booking = await Booking.findOne({
    _id: request.params.bookingId,
    user: request.user._id,
    status: { $in: ['pending', 'confirmed'] },
    seatsReserved: true
  }).populate('event', 'date');

  if (!booking) {
    throw new ApiError(404, 'This booking cannot be cancelled.');
  }

  if (new Date(booking.event.date) <= new Date()) {
    throw new ApiError(400, 'Past events cannot be cancelled.');
  }

  booking.status = 'cancelled';
  booking.seatsReserved = false;
  booking.cancellationReason = request.body.reason?.trim() || undefined;
  await booking.save();
  await releaseEventSeats(booking.event._id, booking.numberOfTickets);

  response.status(200).json({ success: true, message: 'Booking cancelled successfully.', data: { booking } });
});

export {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  resendBookingOtp,
  verifyBooking
};