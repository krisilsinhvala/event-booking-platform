import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookingPanel from '../components/bookings/BookingPanel';
import StateMessage from '../components/common/StateMessage';
import { getEventById } from '../services/eventService';
import getMediaUrl from '../utils/media';

const defaultFallbackImage =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));

function EventDetailsBookingPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [state, setState] = useState('loading');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    getEventById(eventId, controller.signal)
      .then((result) => {
        setEvent(result);
        setState('ready');
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setState('error');
      });
    return () => controller.abort();
  }, [eventId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title || 'Eventora Event',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (state === 'loading') {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-6 w-32 animate-pulse rounded bg-mist" />
        <div className="mt-6 h-[400px] animate-pulse rounded-3xl bg-mist" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-3xl bg-mist lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-3xl bg-mist" />
        </div>
      </main>
    );
  }

  if (state === 'error' || !event) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <StateMessage
          type="error"
          title="Event not found"
          message="This event may have concluded, changed URL, or been archived by its organizer."
          action={
            <Link
              to="/events"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white shadow-xs"
            >
              <ArrowLeft size={16} /> Back to all events
            </Link>
          }
        />
      </main>
    );
  }

  const imageUrl = imageError ? defaultFallbackImage : getMediaUrl(event.image) || defaultFallbackImage;
  const seatsPercentage = Math.round((event.availableSeats / (event.totalSeats || 1)) * 100);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink/65 transition hover:text-coral"
        >
          <ArrowLeft size={16} /> Back to all events
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="#booking-section"
            className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-coral-dark lg:hidden"
          >
            <Ticket size={13} /> Book Tickets
          </a>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-2xs transition hover:bg-sand"
          >
            <Share2 size={13} /> Share Event
          </button>
        </div>
      </div>

      {/* Hero Banner Container */}
      <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft">
        <div className="relative h-[280px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden bg-ink">
          <img
            src={imageUrl}
            alt={event.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
          {/* Subtle Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

          {/* Category & Verified Host Tag */}
          <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow-sm backdrop-blur-md">
              <Sparkles size={13} className="text-coral" />
              {event.category || 'Event'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
              <ShieldCheck size={13} /> Verified Host
            </span>
          </div>

          {/* Title on Banner (Mobile & Tablet) */}
          <div className="absolute bottom-6 left-6 right-6 lg:hidden">
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Details & Booking Layout */}
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-12">
          {/* Left Column: Event Information */}
          <div className="lg:col-span-7">
            {/* Title (Desktop) */}
            <h1 className="hidden font-display text-4xl font-bold leading-tight text-ink lg:block lg:text-5xl">
              {event.title}
            </h1>

            {/* Quick Metadata Pill Grid */}
            <div className="mt-8 grid gap-4 rounded-3xl border border-ink/10 bg-sand/30 p-6 sm:grid-cols-2">
              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-coral shadow-2xs">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Date</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-coral shadow-2xs">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Time</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{event.time || 'Schedule TBA'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-coral shadow-2xs">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Venue & Location</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{event.venue}</p>
                  <p className="text-xs text-ink/60">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-coral shadow-2xs">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/45">Seat Availability</p>
                  <p className="mt-0.5 text-sm font-bold text-ink">
                    {event.availableSeats} of {event.totalSeats} seats left
                  </p>
                  {/* Visual Seats Progress Bar */}
                  <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
                    <div
                      className={`h-full rounded-full transition-all ${
                        seatsPercentage < 20 ? 'bg-rose-500' : 'bg-coral'
                      }`}
                      style={{ width: `${Math.max(seatsPercentage, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-ink">About this experience</h2>
              <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink/75">
                {event.description}
              </div>
            </div>

            {/* Organizer Trust Card */}
            <div className="mt-12 rounded-3xl border border-ink/10 bg-white p-6 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-lg font-bold text-white">
                  {event.title.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">Hosted by Eventora Verified Partner</h3>
                    <CheckCircle2 size={16} className="text-coral" />
                  </div>
                  <p className="text-xs text-ink/50">
                    Official ticket partner with verified entry and real-time support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div id="booking-section" className="lg:col-span-5 scroll-mt-24">
            <div className="lg:sticky lg:top-24">
              <BookingPanel event={event} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EventDetailsBookingPage;
