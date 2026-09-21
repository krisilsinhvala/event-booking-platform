import express from 'express';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  toggleEventPublishing,
  updateEvent
} from '../controllers/adminEventController.js';
import uploadEventImage from '../middleware/uploadMiddleware.js';
import { validateEvent } from '../validators/eventValidators.js';
import {
  approveBooking,
  getAdminBookingById,
  getAdminBookings,
  markCashBookingPaid,
  rejectBooking,
  updateBookingStatus
} from '../controllers/adminBookingController.js';

const router = express.Router();

router.get('/access', authenticate, authorize('admin'), (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Admin access confirmed.',
    data: { userId: request.user._id }
  });
});

router.use(authenticate, authorize('admin'));
router.get('/events', getAdminEvents);
router.post('/events', uploadEventImage.single('image'), validateEvent, createEvent);
router.put('/events/:eventId', uploadEventImage.single('image'), validateEvent, updateEvent);
router.delete('/events/:eventId', deleteEvent);
router.patch('/events/:eventId/publish', toggleEventPublishing);
router.get('/bookings', getAdminBookings);
router.get('/bookings/:bookingId', getAdminBookingById);
router.patch('/bookings/:bookingId/mark-paid', markCashBookingPaid);
router.patch('/bookings/:bookingId/approve', approveBooking, updateBookingStatus);
router.patch('/bookings/:bookingId/reject', rejectBooking, updateBookingStatus);
router.patch('/bookings/:bookingId/status', updateBookingStatus);

export default router;