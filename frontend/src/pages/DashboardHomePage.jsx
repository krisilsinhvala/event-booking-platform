import {
  ArrowRight,
  Calendar,
  CalendarCheck2,
  Clock,
  Compass,
  CreditCard,
  MapPin,
  Sparkles,
  Ticket,
  WalletCards
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import StateMessage from '../components/common/StateMessage';
import { getMyBookings } from '../services/bookingService';

function DashboardHomePage() {
  const [bookings, setBookings] = useState([]);
  const [state, setState] = useState('loading');
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');

  useEffect(() => {
    getMyBookings()
      .then((result) => {
        setBookings(result || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  if (state === 'loading') {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 animate-pulse rounded bg-mist" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-28 animate-pulse rounded-3xl bg-mist" />
          <div className="h-28 animate-pulse rounded-3xl bg-mist" />
          <div className="h-28 animate-pulse rounded-3xl bg-mist" />
          <div className="h-28 animate-pulse rounded-3xl bg-mist" />
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-mist" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <StateMessage
        type="error"
        title="Dashboard unavailable"
        message="We could not load your booking details. Please try refreshing or signing in again."
      />
    );
  }

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const pending = bookings.filter((b) => b.status === 'pending');
  const totalSpent = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'rejected')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const nextUpcoming = confirmed.length > 0 ? confirmed[0] : null;

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Ticket, color: 'text-coral bg-coral/10' },
    { label: 'Confirmed', value: confirmed.length, icon: CalendarCheck2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Payment', value: pending.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    {
      label: 'Booked Value',
      value: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(totalSpent),
      icon: WalletCards,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        badge="Dashboard Overview"
        title={`Welcome, ${user.name?.split(' ')[0] || 'Friend'}!`}
        subtitle="Here is a live summary of your booked experiences and upcoming schedules."
        actions={
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral-hover hover:shadow-glow"
          >
            <Compass size={16} /> Explore Events
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-ink">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
          </div>
        ))}
      </div>

      {/* Next Upcoming Highlight Card (if user has a confirmed booking) */}
      {nextUpcoming && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles size={13} /> Next Upcoming Event
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
                {nextUpcoming.event?.title || 'Confirmed Booking'}
              </h2>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-ink/70">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-600" />
                  {nextUpcoming.event?.date
                    ? new Date(nextUpcoming.event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Date TBA'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-600" />
                  {nextUpcoming.event?.venue || 'Venue TBA'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ticket size={14} className="text-emerald-600" />
                  {nextUpcoming.numberOfTickets} Ticket(s)
                </span>
              </div>
            </div>

            <Link
              to={`/dashboard/bookings/${nextUpcoming._id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-emerald-600"
            >
              View Ticket
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Bookings Section */}
      <div>
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Recent bookings</h2>
            <p className="mt-1 text-xs text-ink/50">Your most recently created event reservations</p>
          </div>
          <Link
            to="/dashboard/bookings"
            className="text-xs font-bold text-coral transition hover:underline"
          >
            View all bookings ({bookings.length})
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Your calendar is open"
              message="You haven't booked any events yet. Discover concerts, workshops, or activities happening this weekend."
              action={
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-2.5 text-sm font-bold text-white shadow-xs"
                >
                  <Compass size={16} /> Explore Events
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {bookings.slice(0, 4).map((booking) => (
              <Link
                key={booking._id}
                to={`/dashboard/bookings/${booking._id}`}
                className="group flex flex-col justify-between gap-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-soft sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sand/60 text-coral group-hover:bg-coral group-hover:text-white transition">
                    <Ticket size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-coral transition">
                      {booking.event?.title || 'Event Booking'}
                    </h3>
                    <p className="mt-1 text-xs text-ink/55">
                      {booking.event?.venue} • {booking.numberOfTickets} ticket(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end border-t border-ink/5 pt-3 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="font-display text-base font-bold text-ink">
                      ₹{booking.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-[11px] capitalize text-ink/45">
                      {booking.paymentMethod === 'online' ? 'Razorpay' : 'Cash'}
                    </p>
                  </div>
                  <Badge status={booking.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHomePage;
