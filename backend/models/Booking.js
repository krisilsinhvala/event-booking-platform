import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    numberOfTickets: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentMethod: { type: String, enum: ['online', 'cash'], required: true, default: 'cash', index: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true },
    paymentAmount: { type: Number, min: 0 },
    paidAt: { type: Date },
    bookingOtpHash: { type: String, select: false },
    bookingOtpExpiry: { type: Date, select: false },
    bookingOtpSentAt: { type: Date, select: false },
    verifiedAt: { type: Date },
    seatsReserved: { type: Boolean, default: false },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date }
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;