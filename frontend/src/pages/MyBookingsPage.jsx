import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  CircleX,
  ArrowRight,
  Search,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../components/common/Badge';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import { cancelBooking, getMyBookings } from '../services/bookingService';

const formatDate = (date) => {
  if (!date) return 'Date TBA';
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
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

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [state, setState] = useState('loading');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  useEffect(() => {
    getMyBookings()
      .then((result) => {
        setBookings(result || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const handleCopyCode = (id) => {
    const code = id.slice(-8).toUpperCase();
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    toast.info(`Booking reference #${code} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancelId) return;
    setCancellingId(confirmCancelId);
    try {
      await cancelBooking(confirmCancelId, 'Cancelled by user');
      setBookings((current) =>
        current.map((booking) =>
          booking._id === confirmCancelId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      toast.success('Booking cancelled successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'cancelled'
          ? b.status === 'cancelled' || b.status === 'rejected'
          : b.status === activeTab;

      const title = b.event?.title?.toLowerCase() || '';
      const venue = b.event?.venue?.toLowerCase() || '';
      const refCode = b._id?.slice(-8).toLowerCase() || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || venue.includes(q) || refCode.includes(q);
      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, searchQuery]);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-4 w-96 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-sand/60" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center sm:p-12">
        <AlertTriangle className="mx-auto text-rose-500" size={40} />
        <h2 className="mt-4 font-display text-2xl font-bold text-ink">Bookings Unavailable</h2>
        <p className="mt-2 text-sm text-ink/60">
          We couldn&apos;t load your bookings right now. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-coral"
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
            <Ticket size={14} /> My Event Passes
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            View, download digital passes, or manage your reservations.
          </p>
        </div>

        {bookings.length > 0 && (
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-dark hover:shadow-md"
          >
            <span>Book Another Event</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {bookings.length > 0 && (
        <>
          {/* Controls: Tabs & Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 pb-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'confirmed', label: 'Confirmed', count: counts.confirmed },
                { id: 'pending', label: 'Pending', count: counts.pending },
                { id: 'cancelled', label: 'Cancelled', count: counts.cancelled }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-sand/60 text-ink/70 hover:bg-sand hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-ink/10 text-ink/60'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search within bookings */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="w-full rounded-xl border border-ink/15 bg-white pl-9 pr-4 py-1.5 text-xs text-ink outline-none transition-all placeholder:text-ink/40 focus:border-coral focus:ring-2 focus:ring-coral/20"
              />
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyState
                title="No bookings match your filter"
                message="Try selecting a different filter tab or clearing your search term."
                action={
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:bg-sand"
                  >
                    Reset Filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-5">
              {filteredBookings.map((booking) => {
                const event = booking.event || {};
                const refCode = booking._id.slice(-8).toUpperCase();
                const canCancel =
                  booking.status === 'confirmed' || booking.status === 'pending';

                return (
                  <article
                    key={booking._id}
                    className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft transition-all duration-300 hover:border-coral/40 hover:shadow-card"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Left: Event Thumbnail / Poster */}
                      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-sand sm:h-52 lg:h-auto lg:w-56">
                        <img
                          src={
                            event.image ||
                            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={event.title || 'Event'}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:hidden" />
                        {event.category && (
                          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            {event.category}
                          </span>
                        )}
                      </div>

                      {/* Center: Details */}
                      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                        <div>
                          {/* Top row: Status badges & Reference */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge status={booking.status} />
                              <Badge status={booking.paymentStatus} />
                              <Badge
                                status={booking.paymentMethod}
                                text={
                                  booking.paymentMethod === 'online'
                                    ? 'Razorpay'
                                    : 'Cash at Venue'
                                }
                              />
                            </div>

                            <button
                              onClick={() => handleCopyCode(booking._id)}
                              className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-sand/60 px-2.5 py-1 text-[11px] font-mono font-medium text-ink/70 hover:bg-sand hover:text-ink transition-colors"
                              title="Click to copy reference ID"
                            >
                              <span>Ref: #{refCode}</span>
                              {copiedId === booking._id ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy
                                  size={12}
                                  className="text-ink/40 group-hover/btn:text-ink"
                                />
                              )}
                            </button>
                          </div>

                          {/* Event Title */}
                          <Link
                            to={`/dashboard/bookings/${booking._id}`}
                            className="mt-3 block font-display text-xl font-bold tracking-tight text-ink transition-colors hover:text-coral sm:text-2xl"
                          >
                            {event.title || 'Event Booking'}
                          </Link>

                          {/* Metadata grid */}
                          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-ink/65 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays size={15} className="shrink-0 text-coral" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={15} className="shrink-0 text-coral" />
                              <span>{event.time || '7:00 PM'}</span>
                            </div>
                            <div className="flex items-center gap-2 truncate">
                              <MapPin size={15} className="shrink-0 text-coral" />
                              <span className="truncate">{event.venue || 'Venue TBA'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Price & Actions */}
                        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-ink/10 pt-4 sm:flex-row sm:items-center">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-ink/50">
                              {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''} •
                            </span>
                            <span className="text-lg font-bold text-ink">
                              {formatPrice(booking.totalAmount)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {canCancel && (
                              <button
                                type="button"
                                disabled={cancellingId === booking._id}
                                onClick={() => setConfirmCancelId(booking._id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                              >
                                <CircleX size={14} />
                                <span>{cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}</span>
                              </button>
                            )}

                            <Link
                              to={`/dashboard/bookings/${booking._id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-coral hover:shadow-sm"
                            >
                              <span>View Digital Ticket</span>
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Zero Bookings State */}
      {bookings.length === 0 && (
        <div className="rounded-3xl border border-ink/10 bg-white p-8 sm:p-12">
          <EmptyState
            title="No bookings yet"
            message="You haven't reserved any tickets yet. Explore upcoming concerts, workshops, and meetups happening near you."
            action={
              <Link
                to="/events"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-coral px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-coral-dark hover:shadow-lg"
              >
                <span>Explore Events</span>
                <ArrowRight size={16} />
              </Link>
            }
          />
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      <ConfirmModal
        open={!!confirmCancelId}
        title="Cancel this booking?"
        message="This action cannot be undone. Your tickets will be released and you may lose your spot."
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        isLoading={!!cancellingId}
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancelId(null)}
      />
    </div>
  );
}

export default MyBookingsPage;
