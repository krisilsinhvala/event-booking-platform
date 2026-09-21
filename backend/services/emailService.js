import nodemailer from 'nodemailer';
import { environment } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const createTransporter = () => {
  if (!environment.smtpHost || !environment.smtpUser || !environment.smtpPassword) {
    throw new ApiError(503, 'Email delivery is not configured. Add SMTP settings to backend/.env.');
  }

  return nodemailer.createTransport({
    host: environment.smtpHost,
    port: environment.smtpPort,
    secure: environment.smtpPort === 465,
    auth: {
      user: environment.smtpUser,
      pass: environment.smtpPassword
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: environment.smtpFrom,
    to,
    subject,
    text,
    html
  });
};

const sendOtpEmail = ({ email, otp, purpose }) => {
  const isPasswordReset = purpose === 'password-reset';
  const isBookingVerification = purpose === 'booking-verification';
  const subject = isPasswordReset ? 'Reset your Eventora password' : isBookingVerification ? 'Verify your Eventora booking' : 'Verify your Eventora email';
  const action = isPasswordReset ? 'reset your password' : isBookingVerification ? 'verify your booking' : 'verify your email address';

  return sendEmail({
    to: email,
    subject,
    text: `Use ${otp} to ${action}. This code expires in 10 minutes.`,
    html: `<p>Use <strong>${otp}</strong> to ${action}.</p><p>This code expires in 10 minutes.</p>`
  });
};

const sendBookingConfirmationEmail = ({ email, booking }) => {
  const eventTitle = booking.event?.title || 'your Eventora event';
  const bookingId = booking._id.toString();
  const paymentMethod = booking.paymentMethod === 'online' ? 'Online' : 'Cash';
  const paymentStatus = booking.paymentStatus === 'paid' ? 'Paid' : 'Pending';

  return sendEmail({
    to: email,
    subject: `Your Eventora booking is confirmed: ${eventTitle}`,
    text: `Your booking for ${eventTitle} is confirmed. Booking ID: ${bookingId}. Tickets: ${booking.numberOfTickets}. Total: INR ${booking.totalAmount.toFixed(2)}. Payment method: ${paymentMethod}. Payment status: ${paymentStatus}. Booking status: ${booking.status}.`,
    html: `<p>Your booking for <strong>${eventTitle}</strong> is confirmed.</p><p>Booking ID: ${bookingId}<br>Tickets: ${booking.numberOfTickets}<br>Total: INR ${booking.totalAmount.toFixed(2)}<br>Payment method: ${paymentMethod}<br>Payment status: ${paymentStatus}<br>Booking status: ${booking.status}</p>`
  });
};

const sendCashBookingEmail = ({ email, booking }) => {
  const eventTitle = booking.event?.title || 'your Eventora event';
  const bookingId = booking._id.toString();

  return sendEmail({
    to: email,
    subject: `Your Eventora cash booking: ${eventTitle}`,
    text: `Your booking for ${eventTitle} was created. Payment method: Cash. Payment status: Pending. Tickets: ${booking.numberOfTickets}. Total: INR ${booking.totalAmount.toFixed(2)}. Booking ID: ${bookingId}.`,
    html: `<p>Your booking for <strong>${eventTitle}</strong> was created.</p><p>Payment method: Cash<br>Payment status: Pending<br>Tickets: ${booking.numberOfTickets}<br>Total: INR ${booking.totalAmount.toFixed(2)}<br>Booking ID: ${bookingId}</p><p>Your booking will remain pending until the cash payment is confirmed by the admin.</p>`
  });
};

const sendBookingRejectionEmail = ({ email, booking, reason }) => {
  const eventTitle = booking.event?.title || 'your Eventora event';
  const reasonText = reason?.trim() || 'The organizer was unable to approve this booking.';

  return sendEmail({
    to: email,
    subject: `Update about your Eventora booking: ${eventTitle}`,
    text: `Your booking for ${eventTitle} was not approved. Reason: ${reasonText}`,
    html: `<p>Your booking for <strong>${eventTitle}</strong> was not approved.</p><p>Reason: ${reasonText}</p>`
  });
};

export { sendBookingConfirmationEmail, sendBookingRejectionEmail, sendCashBookingEmail, sendEmail, sendOtpEmail };