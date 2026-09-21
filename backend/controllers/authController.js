import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';
import {
  assertResendAllowed,
  compareOtp,
  generateOtp,
  getOtpExpiry,
  hashOtp,
  isOtpExpired
} from '../services/otpService.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { verifyGoogleIdToken } from '../services/googleAuthService.js';

const register = asyncHandler(async (request, response) => {
  const { name, email, password } = request.body;
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    isVerified: true
  });

  response.status(201).json({
    success: true,
    message: 'Account created successfully. You can now sign in.',
    data: {
      user: user.toJSON(),
      requiresVerification: false
    }
  });
});

const verifyEmail = asyncHandler(async (request, response) => {
  const { email, otp } = request.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+otpHash +otpExpiry'
  );

  if (!user || user.isVerified || !user.otpHash || isOtpExpired(user.otpExpiry)) {
    throw new ApiError(400, 'The verification code is invalid or expired.');
  }

  if (!(await compareOtp(otp, user.otpHash))) {
    throw new ApiError(400, 'The verification code is invalid or expired.');
  }

  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiry = undefined;
  user.otpSentAt = undefined;
  await user.save();

  response.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
    data: null
  });
});

const resendEmailOtp = asyncHandler(async (request, response) => {
  const normalizedEmail = request.body.email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+otpHash +otpExpiry +otpSentAt'
  );

  if (!user || user.isVerified) {
    response.status(200).json({
      success: true,
      message: 'If the account needs verification, a new code has been sent.',
      data: null
    });
    return;
  }

  assertResendAllowed(user.otpSentAt);
  const otp = generateOtp();
  user.otpHash = await hashOtp(otp);
  user.otpExpiry = getOtpExpiry();
  user.otpSentAt = new Date();
  await user.save();
  await sendOtpEmail({ email: user.email, otp, purpose: 'email-verification' });

  response.status(200).json({
    success: true,
    message: 'If the account needs verification, a new code has been sent.',
    data: null
  });
});

const forgotPassword = asyncHandler(async (request, response) => {
  const normalizedEmail = request.body.email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+passwordResetHash +passwordResetExpiry +passwordResetSentAt'
  );

  if (user) {
    assertResendAllowed(user.passwordResetSentAt);
    const otp = generateOtp();
    user.passwordResetHash = await hashOtp(otp);
    user.passwordResetExpiry = getOtpExpiry();
    user.passwordResetSentAt = new Date();
    await user.save();
    try {
      await sendOtpEmail({ email: user.email, otp, purpose: 'password-reset' });
    } catch (error) {
      user.passwordResetHash = undefined;
      user.passwordResetExpiry = undefined;
      user.passwordResetSentAt = undefined;
      await user.save();
      throw new ApiError(503, 'Password reset email could not be sent. Check the email service configuration.');
    }
  }

  response.status(200).json({
    success: true,
    message: 'If an account exists for that email, password reset instructions have been sent.',
    data: null
  });
});

const resetPassword = asyncHandler(async (request, response) => {
  const { email, otp, password } = request.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+passwordResetHash +passwordResetExpiry'
  );

  if (
    !user ||
    !user.passwordResetHash ||
    isOtpExpired(user.passwordResetExpiry) ||
    !(await compareOtp(otp, user.passwordResetHash))
  ) {
    throw new ApiError(400, 'The password reset code is invalid or expired.');
  }

  user.password = password;
  user.passwordResetHash = undefined;
  user.passwordResetExpiry = undefined;
  user.passwordResetSentAt = undefined;
  await user.save();

  response.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now log in.',
    data: null
  });
});

const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  response.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token: generateToken(user),
      user: user.toJSON()
    }
  });
});

const logout = asyncHandler(async (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Logout successful. Remove the token from the client.',
    data: null
  });
});

const getCurrentUser = asyncHandler(async (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Authenticated user retrieved.',
    data: { user: request.user.toJSON() }
  });
});

const googleAuth = asyncHandler(async (request, response) => {
  const { idToken } = request.body;
  const googlePayload = await verifyGoogleIdToken(idToken);

  // 1. Check for an existing account with this verified Google ID
  let user = await User.findOne({ googleId: googlePayload.googleId });

  // 2. If not found by googleId, check by verified email (account-linking)
  if (!user) {
    user = await User.findOne({ email: googlePayload.email });

    if (user) {
      // Conflict check: if the account is already linked to a DIFFERENT Google account
      if (user.googleId && user.googleId !== googlePayload.googleId) {
        throw new ApiError(
          409,
          'An account with this email is already linked to a different Google account.'
        );
      }

      // Safe account linking: attach verified Google ID to existing local account
      user.googleId = googlePayload.googleId;
    }
  }

  if (user) {
    let isModified = user.isModified('googleId');

    // Ensure account is marked verified because Google has cryptographically verified email
    if (!user.isVerified) {
      user.isVerified = true;
      isModified = true;
    }

    // Set avatar if user does not have an avatar yet and Google provides one
    if (!user.profile?.avatar && googlePayload.picture) {
      user.profile = user.profile || {};
      user.profile.avatar = googlePayload.picture;
      isModified = true;
    }

    if (isModified) {
      await user.save();
    }
  } else {
    // CASE 1: Brand new Google user registration
    user = await User.create({
      name: googlePayload.name,
      email: googlePayload.email,
      googleId: googlePayload.googleId,
      authProvider: 'google',
      role: 'user', // strictly default to 'user', never admin
      isVerified: true,
      profile: {
        avatar: googlePayload.picture || ''
      }
    });
  }

  response.status(200).json({
    success: true,
    message: 'Google authentication successful.',
    data: {
      token: generateToken(user),
      user: user.toJSON()
    }
  });
});

export {
  forgotPassword,
  getCurrentUser,
  googleAuth,
  login,
  logout,
  register,
  resendEmailOtp,
  resetPassword,
  verifyEmail
};