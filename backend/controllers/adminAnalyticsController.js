import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const getAdminDashboard = asyncHandler(async (request, response) => {
  const revenueStart = new Date();
  revenueStart.setUTCMonth(revenueStart.getUTCMonth() - 5);
  revenueStart.setUTCDate(1);
  revenueStart.setUTCHours(0, 0, 0, 0);

  const [totalUsers, totalEvents, totalBookings, confirmedBookings, pendingBookings, cancelledBookings, rejectedBookings, revenueResult, onlineRevenueResult, cashRevenueResult, pendingCashPayments, revenueTrend] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Event.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Booking.countDocuments({ status: 'rejected' }),
    Booking.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }]),
    Booking.aggregate([{ $match: { paymentMethod: 'online', paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' } } }]),
    Booking.aggregate([{ $match: { paymentMethod: 'cash', paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$totalAmount' } } }]),
    Booking.countDocuments({ paymentMethod: 'cash', paymentStatus: 'pending' }),
    Booking.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: revenueStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  response.status(200).json({
    success: true,
    message: 'Admin dashboard analytics retrieved successfully.',
    data: {
      metrics: { totalUsers, totalEvents, totalBookings, confirmedBookings, pendingBookings, cancelledBookings, rejectedBookings, totalRevenue: Number((revenueResult[0]?.totalRevenue || 0).toFixed(2)), onlineRevenue: Number((onlineRevenueResult[0]?.revenue || 0).toFixed(2)), cashRevenue: Number((cashRevenueResult[0]?.revenue || 0).toFixed(2)), pendingCashPayments },
      revenueTrend: revenueTrend.map((entry) => ({ date: entry._id, revenue: Number(entry.revenue.toFixed(2)), bookings: entry.bookings }))
    }
  });
});

export default getAdminDashboard;