import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  AlertCircle,
  CircleX,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../components/common/Badge';
import StateMessage from '../components/common/StateMessage';
import { cancelBooking, getBookingById } from '../services/bookingService';

const formatDate = (date) => {
  if (!date) return 'Date TBA';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [state, setState] = useState('loading');
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getBookingById(bookingId)
      .then((result) => {
        setBooking(result);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [bookingId]);

  const handleCopy = () => {
    if (!booking) return;
    const ref = booking._id.slice(-8).toUpperCase();
    navigator.clipboard?.writeText(ref);
    setCopied(true);
    toast.info(`Reference code #${ref} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && booking?.event) {
      navigator
        .share({
          title: booking.event.title,
          text: `I'm attending ${booking.event.title}! Check it out on Eventora:`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.info('Pass link copied to clipboard!');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }
    setCancelling(true);
    try {
      const result = await cancelBooking(bookingId, 'Cancelled by user');
      setBooking(result);
      toast.success('Booking cancelled.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-sand/80" />
        <div className="h-96 animate-pulse rounded-3xl bg-sand/60" />
      </div>
    );
  }

  if (state === 'error' || !booking) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <StateMessage
          type="error"
          title="Booking Not Found"
          message="This booking may no longer exist, or you may not have permission to view it."
          action={
            <Link
              to="/dashboard/bookings"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-coral"
            >
              <ArrowLeft size={14} /> Back to My Bookings
            </Link>
          }
        />
      </div>
    );
  }

  const event = booking.event || {};
  const refCode = booking._id.slice(-8).toUpperCase();
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
  const unitPrice = event.price || 0;
  const total = booking.totalAmount || 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => navigate('/dashboard/bookings')}
          className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 transition-colors hover:text-coral"
        >
          <ArrowLeft size={16} />
          <span>Back to Bookings</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs transition-colors hover:bg-sand"
            title="Share pass"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-coral"
          >
            <Printer size={14} />
            <span>Print / Save Pass</span>
          </button>
        </div>
      </div>

      {/* Main Digital Ticket Pass Card */}
      <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card">
        {/* Ticket Header Banner */}
        <div className="relative bg-gradient-to-r from-ink via-ink/95 to-slate-900 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral font-display text-sm font-bold text-white">
                E
              </span>
              <span className="font-display text-base font-bold tracking-tight">EVENTORA</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sand">
                Official E-Ticket
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge status={booking.status} />
              <Badge status={booking.paymentStatus} />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <span className="rounded-full bg-coral/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-coral">
                  {event.category}
                </span>
              )}
              <span className="text-xs text-sand/60">
                Host: {event.organizerName || 'Verified Organizer'}
              </span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {event.title || 'Event Booking'}
            </h1>
          </div>
        </div>

        {/* Date, Time & Venue Banner */}
        <div className="grid grid-cols-1 divide-y divide-ink/10 border-b border-ink/10 bg-sand/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-xs text-coral">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Date</p>
              <p className="mt-0.5 text-xs font-bold text-ink">{formatDate(event.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-xs text-coral">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Time</p>
              <p className="mt-0.5 text-xs font-bold text-ink">{event.time || 'Gates open at 7:00 PM'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-xs text-coral">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Venue</p>
              <p className="mt-0.5 truncate text-xs font-bold text-ink">{event.venue || 'Venue'}</p>
              <p className="truncate text-[11px] text-ink/55">{event.location || 'Location details'}</p>
            </div>
          </div>
        </div>

        {/* Perforated ticket divider with authentic edge cutouts */}
        <div className="relative flex items-center bg-sand/30 py-2">
          {/* Left semi-circle cutout */}
          <div className="absolute -left-3.5 h-7 w-7 rounded-full bg-sand border-r border-ink/10" />
          {/* Dotted tear line */}
          <div className="w-full border-t-2 border-dashed border-ink/20 mx-4" />
          {/* Right semi-circle cutout */}
          <div className="absolute -right-3.5 h-7 w-7 rounded-full bg-sand border-l border-ink/10" />
        </div>

        {/* Ticket Body & QR Code Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Left: Attendee Details */}
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                  Booking Reference
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-wider text-ink">
                    #{refCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 rounded-md bg-sand/80 px-2 py-1 text-[11px] font-semibold text-ink/70 hover:bg-sand transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                  Passes Reserved
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Ticket size={16} className="text-coral" />
                  <span className="text-sm font-bold text-ink">
                    {booking.numberOfTickets} General Admission Ticket{booking.numberOfTickets > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                  Payment Method
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    status={booking.paymentMethod}
                    text={booking.paymentMethod === 'online' ? 'Razorpay Online' : 'Pay at Venue (Cash)'}
                  />
                  <span className="text-xs text-ink/60">
                    {booking.paymentStatus === 'paid' ? '• Payment Complete' : '• Pending Payment'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: QR Code Visual Pass */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink/10 bg-sand/20 p-5 text-center">
              <div className="rounded-xl border border-ink/10 bg-white p-3 shadow-xs">
                <QrCode size={110} className="text-ink" />
              </div>
              <p className="mt-3 font-mono text-xs font-bold text-ink tracking-widest">
                SCAN AT VENUE GATE
              </p>
              <p className="mt-1 text-[11px] text-ink/50">
                Present this digital pass or printed QR code at the event entrance.
              </p>
            </div>
          </div>

          {/* Price Math Breakdown Box */}
          <div className="rounded-2xl border border-ink/10 bg-sand/30 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Receipt & Fare Summary
            </h3>
            <div className="mt-3 space-y-2 text-xs text-ink/70">
              <div className="flex justify-between">
                <span>
                  Ticket Price ({formatPrice(unitPrice)} × {booking.numberOfTickets})
                </span>
                <span className="font-semibold text-ink">
                  {formatPrice(unitPrice * booking.numberOfTickets)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Convenience Fee</span>
                <span className="font-semibold text-emerald-600">Free / Included</span>
              </div>
              <div className="border-t border-ink/10 pt-2 flex justify-between text-sm font-bold text-ink">
                <span>Total Amount</span>
                <span className="text-base text-coral">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Entry Guidelines Notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 text-xs text-blue-900">
            <ShieldCheck size={18} className="shrink-0 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Entry Guidelines & Venue Policies</p>
              <p className="text-blue-800/80">
                Please arrive at least 15 minutes before showtime. Keep a government-issued photo ID handy alongside this pass. Duplicate or re-scanned passes will be denied access at the gate.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions (Cancel Booking) */}
        {canCancel && (
          <div className="flex items-center justify-between border-t border-ink/10 bg-sand/20 p-5 sm:px-8 print:hidden">
            <div className="text-xs text-ink/60">
              Plans changed? You can cancel your reservation before the event begins.
            </div>
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              <CircleX size={14} />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingDetailsPage;
