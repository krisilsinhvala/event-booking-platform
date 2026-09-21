import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: String, trim: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', category: 'text', location: 'text' });

const Event = mongoose.model('Event', eventSchema);

export default Event;