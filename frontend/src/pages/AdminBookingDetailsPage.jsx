import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  User,
  Mail,
  IndianRupee,
  Check,
  X,
  Banknote,
  ShieldCheck,
  ExternalLink,
  Copy,
  CheckCheck,
  Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../components/common/Badge';
import StateMessage from '../components/common/StateMessage';
import {
  approveAdminBooking,
  getAdminBookingById,
  markCashBookingPaid,
  rejectAdminBooking
} from '../services/adminBookingService';

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

function AdminBookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [state, setState] = useState('loading');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getAdminBookingById(bookingId)
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

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const updated = await approveAdminBooking(bookingId);
      setBooking(updated);
      toast.success('Booking approved successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to approve booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!window.confirm('Mark this cash payment as received and confirmed?')) return;
    setIsProcessing(true);
    try {
      const updated = await markCashBookingPaid(bookingId);
      setBooking(updated);
      toast.success('Cash payment confirmed and marked as paid.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to confirm payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Optional rejection reason to share with the guest:');
    if (reason === null) return;
    setIsProcessing(true);
    try {
      const updated = await rejectAdminBooking(bookingId, reason);
      setBooking(updated);
      toast.success('Booking rejected.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reject booking.');
    } finally {
      setIsProcessing(false);
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
          message="This reservation could not be loaded or may have been deleted."
          action={
            <Link
              to="/admin/bookings"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-coral"
            >
              <ArrowLeft size={14} /> Back to Bookings
            </Link>
          }
        />
      </div>
    );
  }

  const event = booking.event || {};
  const guest = booking.user || {};
  const refCode = booking._id.slice(-8).toUpperCase();
  const isPending = booking.status === 'pending';
  const isCashPending =
    booking.paymentMethod === 'cash' &&
    (booking.paymentStatus === 'pending' || booking.paymentStatus === 'unpaid');

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/admin/bookings')}
          className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 transition-colors hover:text-coral"
        >
          <ArrowLeft size={15} />
          <span>Back to Bookings Queue</span>
        </button>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
              <Ticket size={14} /> Reservation Audit
            </span>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Booking #{refCode}
              </h1>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg bg-sand/80 px-2 py-1 text-xs font-semibold text-ink/70 hover:bg-sand transition-colors"
                title="Copy reference code"
              >
                {copied ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-1 text-sm text-ink/60">
              Submitted on {formatDate(booking.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge status={booking.status} />
            <Badge status={booking.paymentStatus} />
            <Badge
              status={booking.paymentMethod}
              text={booking.paymentMethod === 'online' ? 'Razorpay' : 'Cash'}
            />
          </div>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-6">
        {/* Guest Profile Box */}
        <div className="rounded-2xl border border-ink/10 bg-sand/30 p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink/45 mb-3">
            Guest Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink/60 shadow-xs">
                <User size={18} />
              </div>
              <div>
                <p className="text-xs text-ink/50">Full Name</p>
                <p className="font-bold text-ink">{guest.name || 'Anonymous User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink/60 shadow-xs">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink/50">Email Address</p>
                <p className="truncate font-bold text-ink">{guest.email || 'No email registered'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Box */}
        <div className="rounded-2xl border border-ink/10 bg-sand/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Event Details
            </h2>
            {event._id && (
              <Link
                to={`/events/${event._id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-coral hover:underline"
              >
                <span>View Public Page</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

          <h3 className="font-display text-xl font-bold text-ink">{event.title || 'Event Booking'}</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs text-ink/70">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-coral shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-coral shrink-0" />
              <span>{event.time || 'Time TBA'}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin size={16} className="text-coral shrink-0" />
              <span className="truncate">{event.venue || 'Venue TBA'}</span>
            </div>
          </div>
        </div>

        {/* Ticketing & Payment Breakdown */}
        <div className="rounded-2xl border border-ink/10 bg-sand/30 p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink/45 mb-3">
            Ticketing & Settlement Summary
          </h2>

          <div className="space-y-2 text-xs text-ink/70">
            <div className="flex justify-between">
              <span>Passes Reserved</span>
              <span className="font-bold text-ink">
                {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Channel</span>
              <span className="font-semibold text-ink">
                {booking.paymentMethod === 'online' ? 'Razorpay Online Gateway' : 'Cash on Arrival'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className="font-semibold text-ink capitalize">
                {booking.paymentStatus}
              </span>
            </div>
            <div className="border-t border-ink/10 pt-2 flex justify-between text-sm font-bold text-ink">
              <span>Total Payable</span>
              <span className="text-base text-coral">{formatPrice(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Administrative Action Toolbar */}
        {(isPending || isCashPending) && (
          <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-6">
            {isCashPending && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleMarkPaid}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                <Banknote size={15} />
                <span>Confirm Cash Payment Received</span>
              </button>
            )}

            {isPending && (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Check size={15} />
                  <span>Approve Reservation</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  <X size={15} />
                  <span>Reject Reservation</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookingDetailsPage;
