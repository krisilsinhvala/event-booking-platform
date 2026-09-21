import bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import ApiError from '../utils/ApiError.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const generateOtp = () => String(randomInt(100000, 1000000));

const hashOtp = (otp) => bcrypt.hash(otp, 12);

const compareOtp = (otp, otpHash) => bcrypt.compare(otp, otpHash);

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MS);

const assertResendAllowed = (sentAt) => {
  if (!sentAt) {
    return;
  }

  const remainingMilliseconds = OTP_RESEND_COOLDOWN_MS - (Date.now() - sentAt.getTime());

  if (remainingMilliseconds > 0) {
    const retryAfterSeconds = Math.ceil(remainingMilliseconds / 1000);
    throw new ApiError(429, `Please wait ${retryAfterSeconds} seconds before requesting another code.`);
  }
};

const isOtpExpired = (expiry) => !expiry || expiry.getTime() <= Date.now();

export { assertResendAllowed, compareOtp, generateOtp, getOtpExpiry, hashOtp, isOtpExpired };