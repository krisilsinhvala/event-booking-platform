import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Search,
  Ticket,
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  User,
  Mail,
  ArrowRight,
  Filter,
  Copy,
  CheckCheck,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import {
  approveAdminBooking,
  getAdminBookings,
  markCashBookingPaid,
  rejectAdminBooking
} from '../services/adminBookingService';

const formatDate = (date) => {
  if (!date) return 'Date TBA';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
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

function AdminBookingsPage() {
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    search: ''
  });
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [state, setState] = useState('loading');
  const [copiedId, setCopiedId] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  const loadBookings = () => {
    setState('loading');
    getAdminBookings(filters)
      .then((data) => {
        setBookings(data.bookings || []);
        setPagination(data.pagination);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    loadBookings();
  }, [filters.status, filters.paymentMethod, filters.paymentStatus]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadBookings();
  };

  const updateBooking = (updated) => {
    setBookings((current) =>
      current.map((booking) => (booking._id === updated._id ? updated : booking))
    );
  };

  const handleCopy = (id) => {
    const code = id.slice(-8).toUpperCase();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    toast.info(`Reference #${code} copied.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (bookingId) => {
    setActionInProgress(bookingId);
    try {
      const updated = await approveAdminBooking(bookingId);
      updateBooking(updated);
      toast.success('Booking approved successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to approve booking.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkPaid = async (bookingId) => {
    if (!window.confirm('Mark this cash payment as received and paid?')) return;
    setActionInProgress(bookingId);
    try {
      const updated = await markCashBookingPaid(bookingId);
      updateBooking(updated);
      toast.success('Cash payment recorded as paid.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to mark payment as paid.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Provide an optional rejection reason for the guest:');
    if (reason === null) return;
    setActionInProgress(bookingId);
    try {
      const updated = await rejectAdminBooking(bookingId, reason);
      updateBooking(updated);
      toast.success('Booking rejected.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reject booking.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-4 w-96 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-sand/60" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center sm:p-12">
        <p className="font-semibold text-rose-700">We could not load the admin booking queue.</p>
        <button
          onClick={loadBookings}
          className="mt-4 rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-white hover:bg-coral transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
            <Ticket size={14} /> Guest Reservations
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Manage Bookings
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Process incoming ticket requests, confirm cash settlements, and manage admissions.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-xs font-bold text-ink shadow-xs">
          <Ticket size={14} className="text-coral" />
          <span>{pagination?.totalBookings || bookings.length} Total Reservations</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search by guest name or email..."
            className="w-full rounded-xl border border-ink/15 bg-sand/20 pl-10 pr-4 py-2 text-xs text-ink outline-none transition-all placeholder:text-ink/40 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
          />
        </form>

        {/* Status Dropdown */}
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          className="rounded-xl border border-ink/15 bg-sand/20 px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-coral focus:bg-white"
        >
          <option value="">All Booking Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Method Dropdown */}
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
          className="rounded-xl border border-ink/15 bg-sand/20 px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-coral focus:bg-white"
        >
          <option value="">All Payment Methods</option>
          <option value="online">Online (Razorpay)</option>
          <option value="cash">Cash on Arrival</option>
        </select>

        {/* Payment Status Dropdown */}
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }))}
          className="rounded-xl border border-ink/15 bg-sand/20 px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-coral focus:bg-white"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <EmptyState
            title="No reservations found"
            message="No bookings match your current filter and search settings."
            action={
              <button
                onClick={() => {
                  setFilters({ status: '', paymentMethod: '', paymentStatus: '', search: '' });
                  loadBookings();
                }}
                className="rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold text-ink hover:bg-sand transition-colors"
              >
                Reset All Filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = booking.event || {};
            const guest = booking.user || {};
            const refCode = booking._id.slice(-8).toUpperCase();
            const isCashPending =
              booking.paymentMethod === 'cash' &&
              (booking.paymentStatus === 'pending' || booking.paymentStatus === 'unpaid');
            const isPendingBooking = booking.status === 'pending';

            return (
              <article
                key={booking._id}
                className="overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition-all hover:border-coral/40 hover:shadow-card sm:p-6"
              >
                {/* Top bar: Reference, date, and status badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopy(booking._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sand/70 px-2.5 py-1 font-mono text-xs font-bold text-ink/80 hover:bg-sand transition-colors"
                      title="Click to copy ref code"
                    >
                      <span>#{refCode}</span>
                      {copiedId === booking._id ? (
                        <CheckCheck size={13} className="text-emerald-600" />
                      ) : (
                        <Copy size={13} className="text-ink/40" />
                      )}
                    </button>
                    <span className="text-[11px] text-ink/50">
                      Booked {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={booking.status} />
                    <Badge status={booking.paymentStatus} />
                    <Badge
                      status={booking.paymentMethod}
                      text={booking.paymentMethod === 'online' ? 'Razorpay' : 'Cash on Arrival'}
                    />
                  </div>
                </div>

                {/* Main details grid */}
                <div className="mt-4 grid gap-5 lg:grid-cols-3">
                  {/* Event Info */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                      Event Details
                    </p>
                    <Link
                      to={`/admin/bookings/${booking._id}`}
                      className="block font-display text-lg font-bold text-ink hover:text-coral transition-colors"
                    >
                      {event.title || 'Event Booking'}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-ink/60">
                      <CalendarDays size={13} className="text-coral shrink-0" />
                      <span>{formatDate(event.date)}</span>
                      {event.time && <span>• {event.time}</span>}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-xs text-ink/50 truncate">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Guest Info */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                      Guest Details
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-ink">
                      <User size={14} className="text-ink/40" />
                      <span>{guest.name || 'Anonymous Guest'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink/60">
                      <Mail size={13} className="text-ink/40" />
                      <span>{guest.email || 'No email registered'}</span>
                    </div>
                    <div className="text-xs text-ink/50">
                      Seats reserved: <span className="font-semibold text-ink">{booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Financial & Actions */}
                  <div className="flex flex-col justify-between rounded-2xl bg-sand/30 p-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                        Amount Payable
                      </p>
                      <p className="mt-0.5 font-display text-2xl font-bold text-ink">
                        {formatPrice(booking.totalAmount)}
                      </p>
                      <p className="text-[11px] text-ink/50">
                        {booking.paymentMethod === 'online'
                          ? 'Settled via Razorpay'
                          : 'Due at event registration desk'}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {isCashPending && (
                        <button
                          type="button"
                          disabled={actionInProgress === booking._id}
                          onClick={() => handleMarkPaid(booking._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          <Banknote size={13} />
                          <span>Mark Paid</span>
                        </button>
                      )}

                      {isPendingBooking && (
                        <>
                          <button
                            type="button"
                            disabled={actionInProgress === booking._id}
                            onClick={() => handleApprove(booking._id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            title="Approve booking"
                          >
                            <Check size={13} />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionInProgress === booking._id}
                            onClick={() => handleReject(booking._id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Reject booking"
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      <Link
                        to={`/admin/bookings/${booking._id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-sand transition-colors ml-auto"
                      >
                        <span>Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;
