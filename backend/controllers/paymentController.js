import Booking from '../models/Booking.js';
import { environment } from '../config/env.js';
import { releaseEventSeats } from '../services/bookingService.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getOwnedOnlineBooking = async (bookingId, userId) => {
  const booking = await Booking.findOne({
    _id: bookingId,
    user: userId,
    paymentMethod: 'online'
  }).populate('event', 'title date time venue location ticketPrice');

  if (!booking) throw new ApiError(404, 'Online booking not found.');
  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    throw new ApiError(409, 'This booking cannot be paid for.');
  }

  return booking;
};

const failOnlineBooking = async (booking) => {
  const failedBooking = await Booking.findOneAndUpdate(
    { _id: booking._id, paymentMethod: 'online', paymentStatus: 'pending', seatsReserved: true },
    { $set: { paymentStatus: 'failed', status: 'cancelled', seatsReserved: false, processedAt: new Date() } },
    { new: true }
  );

  if (failedBooking) await releaseEventSeats(failedBooking.event._id || failedBooking.event, failedBooking.numberOfTickets);
};

const createOrder = asyncHandler(async (request, response) => {
  const booking = await getOwnedOnlineBooking(request.body.bookingId, request.user._id);

  if (booking.paymentStatus === 'paid') {
    throw new ApiError(409, 'This booking has already been paid.');
  }

  if (booking.razorpayOrderId) {
    return response.status(200).json({
      success: true,
      message: 'Existing Razorpay order retrieved.',
      data: {
        orderId: booking.razorpayOrderId,
        amount: Math.round(booking.totalAmount * 100),
        currency: 'INR',
        keyId: environment.razorpayKeyId
      }
    });
  }

  const order = await createRazorpayOrder({ bookingId: booking._id, amount: booking.totalAmount });
  booking.razorpayOrderId = order.id;
  booking.paymentAmount = booking.totalAmount;
  await booking.save();

  response.status(201).json({
    success: true,
    message: 'Razorpay order created.',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: environment.razorpayKeyId
    }
  });
});

const verifyPayment = asyncHandler(async (request, response) => {
  const { bookingId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body;
  const booking = await getOwnedOnlineBooking(bookingId, request.user._id);

  if (booking.paymentStatus === 'paid') {
    return response.status(200).json({
      success: true,
      message: 'Payment was already verified.',
      data: { booking }
    });
  }

  if (!orderId || orderId !== booking.razorpayOrderId || !paymentId || !signature) {
    throw new ApiError(400, 'The Razorpay payment details are invalid.');
  }

  let validSignature = false;
  try {
    validSignature = verifyRazorpaySignature({ orderId, paymentId, signature });
  } catch {
    throw new ApiError(400, 'The Razorpay payment signature is invalid.');
  }

  if (!validSignature) {
    await failOnlineBooking(booking);
    throw new ApiError(400, 'Payment verification failed.');
  }

  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: booking._id, paymentStatus: 'pending', paymentMethod: 'online' },
    {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentAmount: booking.totalAmount,
        paidAt: new Date(),
        verifiedAt: new Date()
      }
    },
    { new: true }
  ).populate('event', 'title date time venue location ticketPrice');

  if (!updatedBooking) throw new ApiError(409, 'This payment has already been processed.');

  let emailDelivered = true;
  try {
    await sendBookingConfirmationEmail({ email: request.user.email, booking: updatedBooking });
  } catch (error) {
    emailDelivered = false;
    console.error(`Booking confirmation email failed: ${error.message}`);
  }

  response.status(200).json({
    success: true,
    message: emailDelivered ? 'Payment verified and booking confirmed.' : 'Payment verified and booking confirmed, but the confirmation email could not be delivered.',
    data: { booking: updatedBooking }
  });
});

export { createOrder, verifyPayment };
