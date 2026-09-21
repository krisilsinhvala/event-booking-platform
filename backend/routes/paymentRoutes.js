import express from 'express';
import mongoose from 'mongoose';
import authenticate from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

const validatePaymentRequest = (request, response, next) => {
  const { bookingId } = request.body;
  if (!mongoose.isValidObjectId(bookingId)) {
    return next(new ApiError(400, 'Booking ID is invalid.'));
  }
  next();
};

const validatePaymentVerification = (request, response, next) => {
  const { bookingId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body;
  if (!mongoose.isValidObjectId(bookingId) || !orderId || !paymentId || !signature) {
    return next(new ApiError(400, 'Payment verification data is invalid.'));
  }
  next();
};

router.use(authenticate);
router.post('/create-order', validatePaymentRequest, createOrder);
router.post('/verify', validatePaymentVerification, verifyPayment);

export default router;
