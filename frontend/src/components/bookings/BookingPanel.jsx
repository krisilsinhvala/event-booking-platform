import {
  ArrowRight,
  Banknote,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  Ticket,
  WalletCards
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { cancelBooking, createBooking, createPaymentOrder, verifyPayment } from '../../services/bookingService';

const getErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong processing your booking. Please try again.';

function BookingPanel({ event }) {
  const token = localStorage.getItem('eventoraToken');
  const location = useLocation();
  const [ticketCount, setTicketCount] = useState(1);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = Number((event.ticketPrice * ticketCount).toFixed(2));
  const maxAllowedTickets = Math.min(10, event.availableSeats || 0);

  const abandonOnlineBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId, 'Online payment was cancelled or modal was closed');
    } catch {
      // The backend may already have handled release
    }
    setBooking(null);
    setIsSubmitting(false);
  };

  const openRazorpayCheckout = async (createdBooking) => {
    if (!window.Razorpay) {
      toast.error('Razorpay Checkout is currently unavailable. Please refresh the page.');
      setIsSubmitting(false);
      return;
    }

    try {
      const order = await createPaymentOrder(createdBooking._id);
      const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Eventora',
        description: `Booking for ${event.title}`,
        order_id: order.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || ''
        },
        theme: { color: '#e96f51' },
        handler: async (paymentResponse) => {
          try {
            const result = await verifyPayment({
              bookingId: createdBooking._id,
              ...paymentResponse
            });
            setBooking(result.booking);
            setIsSubmitting(false);
            toast.success('Payment verified! Your booking is confirmed.');
          } catch (error) {
            toast.error(getErrorMessage(error));
            await abandonOnlineBooking(createdBooking._id);
          }
        },
        modal: {
          ondismiss: () => {
            abandonOnlineBooking(createdBooking._id);
          }
        }
      });

      checkout.open();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (event.availableSeats < 1) {
      toast.error('Sorry, this event is sold out.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await createBooking(event._id, ticketCount, paymentMethod);
      setBooking(data.booking);

      if (paymentMethod === 'cash') {
        toast.success('Cash booking created! Payment is pending admin confirmation.');
        setIsSubmitting(false);
        return;
      }

      await openRazorpayCheckout(data.booking);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  // ================= STATE 1: NOT AUTHENTICATED =================
  if (!token) {
    return (
      <aside className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral/10 text-coral">
          <Ticket size={24} />
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold text-ink">Ready to attend?</h2>
        <p className="mt-2.5 text-sm leading-relaxed text-ink/65">
          Sign in or create an Eventora account to select seats and reserve your tickets for this experience.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-center text-sm font-bold text-white shadow-soft transition hover:bg-coral hover:shadow-glow"
          >
            Sign in to book
            <ArrowRight size={15} />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full border border-ink/15 py-3 text-center text-sm font-bold text-ink transition hover:bg-sand"
          >
            Create free account
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-2 border-t border-ink/5 pt-4 text-xs text-ink/50">
          <ShieldCheck size={14} className="text-coral" />
          <span>Fast, secure checkout with instant e-tickets</span>
        </div>
      </aside>
    );
  }

  // ================= STATE 2: BOOKING SUCCESS (ONLINE PAID) =================
  if (booking?.status === 'confirmed' && booking?.paymentStatus === 'paid') {
    return (
      <aside className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-card sm:p-8 text-center animate-in fade-in zoom-in-95">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-md">
          <CheckCircle2 size={34} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-700">Booking Confirmed</p>
        <h2 className="mt-1 font-display text-3xl font-bold text-ink">You are going!</h2>
        <p className="mt-2 text-sm text-ink/65">
          Your payment of <strong>₹{booking.totalAmount.toFixed(2)}</strong> was verified. Your tickets are secured.
        </p>

        <div className="mt-6 space-y-2.5 rounded-2xl border border-emerald-200/80 bg-white p-4 text-left text-xs shadow-2xs">
          <div className="flex justify-between">
            <span className="text-ink/55">Booking Reference:</span>
            <span className="font-mono font-bold text-ink">{booking._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Tickets:</span>
            <span className="font-bold text-ink">{booking.numberOfTickets} ticket(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Payment Method:</span>
            <span className="font-bold text-emerald-700">Razorpay Online · Paid</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            to={`/dashboard/bookings/${booking._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral"
          >
            View Ticket Details
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/dashboard/bookings"
            className="rounded-full border border-ink/15 py-2.5 text-xs font-bold text-ink hover:bg-sand"
          >
            Back to My Bookings
          </Link>
        </div>
      </aside>
    );
  }

  // ================= STATE 3: CASH BOOKING CREATED (PENDING) =================
  if (booking) {
    return (
      <aside className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 shadow-card sm:p-8 text-center animate-in fade-in zoom-in-95">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-500 text-white shadow-md">
          <Clock size={32} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-700">Cash Payment Pending</p>
        <h2 className="mt-1 font-display text-3xl font-bold text-ink">Seats Reserved!</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          Your cash booking was created. Please pay <strong>₹{booking.totalAmount.toFixed(2)}</strong> at the venue organizer desk. An admin will confirm your payment upon arrival.
        </p>

        <div className="mt-6 space-y-2 rounded-2xl border border-amber-200/80 bg-white p-4 text-left text-xs shadow-2xs">
          <div className="flex justify-between">
            <span className="text-ink/55">Booking Reference:</span>
            <span className="font-mono font-bold text-ink">{booking._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Tickets:</span>
            <span className="font-bold text-ink">{booking.numberOfTickets}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Payment Status:</span>
            <span className="font-bold text-amber-700">Pending Admin Confirmation</span>
          </div>
        </div>

        <Link
          to="/dashboard/bookings"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white shadow-soft transition hover:bg-coral"
        >
          View in My Bookings
          <ArrowRight size={14} />
        </Link>
      </aside>
    );
  }

  // ================= STATE 4: ACTIVE BOOKING & PAYMENT FORM =================
  return (
    <aside className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
      {/* Header & Total Price */}
      <div className="flex items-start justify-between border-b border-ink/10 pb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-coral">Select Tickets</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-ink">₹{total.toFixed(2)}</span>
            <span className="text-xs text-ink/50">({ticketCount} × ₹{event.ticketPrice.toFixed(2)})</span>
          </div>
        </div>
        <div className="rounded-2xl bg-sand/60 px-3 py-1.5 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Per Ticket</p>
          <p className="font-bold text-sm text-ink">₹{event.ticketPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Ticket Quantity Stepper */}
      <div className="mt-6">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/60">
          Number of Tickets
        </label>
        <div className="flex items-center justify-between rounded-2xl border border-ink/15 bg-sand/20 p-2">
          <button
            type="button"
            onClick={() => setTicketCount((count) => Math.max(1, count - 1))}
            disabled={ticketCount <= 1}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-2xs transition hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Remove ticket"
          >
            <Minus size={16} />
          </button>

          <div className="text-center">
            <span className="font-display text-xl font-bold text-ink">{ticketCount}</span>
            <span className="ml-1 text-xs text-ink/60">{ticketCount === 1 ? 'ticket' : 'tickets'}</span>
          </div>

          <button
            type="button"
            onClick={() => setTicketCount((count) => Math.min(maxAllowedTickets, count + 1))}
            disabled={ticketCount >= maxAllowedTickets}
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-2xs transition hover:bg-sand disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Add ticket"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="mt-2 text-right text-xs text-ink/50">
          {event.availableSeats > 0
            ? `${event.availableSeats} seats remaining (max 10 per order)`
            : 'Event is currently sold out'}
        </p>
      </div>

      {/* Payment Method Selector */}
      <div className="mt-6">
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
          Choose Payment Method
        </label>
        <div className="space-y-3">
          {/* Option 1: Razorpay Online */}
          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`group relative flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
              paymentMethod === 'online'
                ? 'border-coral bg-coral/5 shadow-soft ring-2 ring-coral/20'
                : 'border-ink/15 bg-white hover:border-ink/30 hover:bg-sand/30'
            }`}
          >
            <div
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                paymentMethod === 'online' ? 'bg-coral text-white' : 'bg-sand text-ink/60'
              }`}
            >
              <CreditCard size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Online Payment</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  Razorpay Secure
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">
                Pay instantly via UPI, Credit/Debit Cards, or Netbanking. Confirmed immediately.
              </p>
            </div>
          </button>

          {/* Option 2: Cash Payment */}
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`group relative flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
              paymentMethod === 'cash'
                ? 'border-coral bg-coral/5 shadow-soft ring-2 ring-coral/20'
                : 'border-ink/15 bg-white hover:border-ink/30 hover:bg-sand/30'
            }`}
          >
            <div
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                paymentMethod === 'cash' ? 'bg-coral text-white' : 'bg-sand text-ink/60'
              }`}
            >
              <Banknote size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-ink">Cash Payment</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Pay At Venue
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">
                Reserve now and pay cash at the venue counter. Booking pending admin confirmation.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Math Breakdown */}
      <div className="mt-6 rounded-2xl bg-sand/40 p-4 text-xs space-y-2">
        <div className="flex justify-between text-ink/70">
          <span>Tickets ({ticketCount} × ₹{event.ticketPrice.toFixed(2)})</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Booking & Processing Fee</span>
          <span className="font-semibold text-emerald-700">FREE</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-2 font-bold text-sm text-ink">
          <span>Total Amount</span>
          <span className="font-display text-base text-coral">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Main CTA Button */}
      <button
        type="button"
        onClick={handleCreate}
        disabled={isSubmitting || event.availableSeats < 1}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-4 text-sm font-bold text-white shadow-card transition-all duration-300 hover:bg-coral-hover hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          paymentMethod === 'online' ? (
            'Opening secure payment...'
          ) : (
            'Creating booking...'
          )
        ) : paymentMethod === 'online' ? (
          <>
            <Lock size={15} />
            Pay ₹{total.toFixed(2)} with Razorpay
          </>
        ) : (
          <>
            <WalletCards size={15} />
            Confirm Cash Booking (₹{total.toFixed(2)})
          </>
        )}
      </button>

      {/* Security note */}
      <p className="mt-4 text-center text-xs text-ink/50 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-600" />
        {paymentMethod === 'online'
          ? 'Encrypted checkout protected by Razorpay.'
          : 'Seats are reserved immediately upon cash submission.'}
      </p>
    </aside>
  );
}

export default BookingPanel;
