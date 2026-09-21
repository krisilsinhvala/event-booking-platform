import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

const validateBookingRequest = (request, response, next) => {
  const { eventId } = request.params;
  const { numberOfTickets, paymentMethod = 'cash' } = request.body;

  if (!mongoose.isValidObjectId(eventId)) {
    return next(new ApiError(400, 'Event ID is invalid.'));
  }

  if (!Number.isInteger(numberOfTickets) || numberOfTickets < 1 || numberOfTickets > 10) {
    return next(new ApiError(400, 'Number of tickets must be an integer between 1 and 10.'));
  }

  if (!['online', 'cash'].includes(paymentMethod)) {
    return next(new ApiError(400, 'Payment method must be online or cash.'));
  }

  next();
};

const validateBookingOtp = (request, response, next) => {
  const { otp } = request.body;

  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return next(new ApiError(400, 'Booking OTP must contain exactly 6 digits.'));
  }

  next();
};

export { validateBookingOtp, validateBookingRequest };