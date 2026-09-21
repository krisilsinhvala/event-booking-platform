import express from 'express';
import { changePassword, getProfile, updateProfile } from '../controllers/userController.js';
import authenticate from '../middleware/authMiddleware.js';
import { validateChangePassword, validateProfileUpdate } from '../validators/userValidators.js';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);
router.put('/change-password', authenticate, validateChangePassword, changePassword);

export default router;