import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import {
	forgotPassword,
	getCurrentUser,
	googleAuth,
	login,
	logout,
	register,
	resendEmailOtp,
	resetPassword,
	verifyEmail
} from '../controllers/authController.js';
import {
	validateEmailOnly,
	validateEmailOtp,
	validateGoogleAuth,
	validateLogin,
	validateRegister,
	validateResetPassword
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/verify-email', validateEmailOtp, verifyEmail);
router.post('/resend-email-otp', validateEmailOnly, resendEmailOtp);
router.post('/login', validateLogin, login);
router.post('/google', validateGoogleAuth, googleAuth);
router.post('/logout', logout);
router.post('/forgot-password', validateEmailOnly, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/me', authenticate, getCurrentUser);

export default router;