import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  resendBookingOtp,
  verifyBooking
} from '../controllers/bookingController.js';
import { validateBookingOtp, validateBookingRequest } from '../validators/bookingValidators.js';

const router = express.Router();

router.use(authenticate);
router.post('/events/:eventId', validateBookingRequest, createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:bookingId', getBookingById);
router.post('/:bookingId/verify', validateBookingOtp, verifyBooking);
router.post('/:bookingId/resend-otp', resendBookingOtp);
router.patch('/:bookingId/cancel', cancelBooking);

export default router;