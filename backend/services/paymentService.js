import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { environment } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

let razorpayClient;

const getRazorpayClient = () => {
  if (!environment.razorpayKeyId || !environment.razorpayKeySecret) {
    throw new ApiError(503, 'Online payments are not configured. Add Razorpay test keys to backend/.env.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: environment.razorpayKeyId,
      key_secret: environment.razorpayKeySecret
    });
  }

  return razorpayClient;
};

const createRazorpayOrder = async ({ bookingId, amount }) => {
  const client = getRazorpayClient();

  try {
    return await client.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `eventora_${bookingId}`,
      notes: { bookingId: String(bookingId) }
    });
  } catch (error) {
    throw new ApiError(502, 'Razorpay order creation failed. Please try again.');
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!environment.razorpayKeySecret) {
    throw new ApiError(503, 'Online payments are not configured. Add Razorpay test keys to backend/.env.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', environment.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (signature.length !== expectedSignature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
};

export { createRazorpayOrder, verifyRazorpaySignature };
