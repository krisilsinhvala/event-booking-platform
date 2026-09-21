import { ArrowRight, Calendar, Clock, MapPin, Sparkles, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import getMediaUrl from '../../utils/media';

const defaultFallbackImage =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85';

function EventCard({ event }) {
  const [imageError, setImageError] = useState(false);

  // Format date components
  const eventDate = new Date(event.date);
  const isValidDate = !isNaN(eventDate.getTime());
  const monthName = isValidDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : 'EVENT';
  const dayNumber = isValidDate ? eventDate.getDate() : '--';
  const fullDate = isValidDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBA';

  // Seat status
  const isSoldOut = event.availableSeats <= 0;
  const isSellingFast = event.availableSeats > 0 && event.availableSeats <= 10;

  const imageUrl = imageError
    ? defaultFallbackImage
    : getMediaUrl(event.image) || defaultFallbackImage;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-coral/30 hover:shadow-card">
      <Link to={`/events/${event._id}`} className="flex h-full flex-col">
        {/* Media Container */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-mist">
          <img
            src={imageUrl}
            alt={event.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* Category Badge */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
            <Sparkles size={11} className="text-coral" />
            <span>{event.category || 'Event'}</span>
          </div>

          {/* Date Badge Overlay */}
          <div className="absolute right-3.5 top-3.5 flex flex-col items-center rounded-2xl bg-white/95 px-2.5 py-1.5 text-center shadow-md backdrop-blur-md">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-coral">
              {monthName}
            </span>
            <span className="font-display text-lg font-black leading-tight text-ink">
              {dayNumber}
            </span>
          </div>

          {/* Seat Urgency Badge */}
          {isSoldOut ? (
            <div className="absolute bottom-3 left-3.5 rounded-full bg-rose-600/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              Sold Out
            </div>
          ) : isSellingFast ? (
            <div className="absolute bottom-3 left-3.5 rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md animate-pulse">
              Only {event.availableSeats} left
            </div>
          ) : null}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Date & Time Row */}
            <div className="flex items-center gap-3 text-xs font-semibold text-ink/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-coral" />
                {fullDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-coral" />
                {event.time || 'TBA'}
              </span>
            </div>

            {/* Event Title */}
            <h3 className="mt-2.5 font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-coral line-clamp-2">
              {event.title}
            </h3>

            {/* Venue & Location */}
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-ink/65 line-clamp-1">
              <MapPin size={14} className="shrink-0 text-coral" />
              <span>
                {event.venue ? `${event.venue}, ` : ''}
                {event.location || 'Location TBA'}
              </span>
            </p>
          </div>

          {/* Card Footer: Price & Action */}
          <div className="mt-5 flex items-center justify-between border-t border-ink/5 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45">Price</p>
              <p className="font-display text-lg font-bold text-ink">
                {event.ticketPrice > 0 ? `₹${event.ticketPrice.toFixed(2)}` : 'Free'}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/60 px-3.5 py-1.5 text-xs font-bold text-ink transition-all group-hover:bg-coral group-hover:text-white group-hover:shadow-xs">
              View Details
              <ArrowRight
                size={13}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default EventCard;
