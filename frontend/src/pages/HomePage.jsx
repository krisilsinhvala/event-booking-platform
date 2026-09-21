import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Flame,
  KeyRound,
  MapPin,
  Music,
  ShieldCheck,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  Wrench,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import StateMessage from '../components/common/StateMessage';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/events/EventCardSkeleton';
import { getEvents } from '../services/eventService';

const categories = [
  { name: 'Music', icon: Music, desc: 'Concerts & live shows', color: 'from-purple-500/10 to-pink-500/10' },
  { name: 'Workshop', icon: Wrench, desc: 'Learn hands-on skills', color: 'from-amber-500/10 to-orange-500/10' },
  { name: 'Sports', icon: Zap, desc: 'Tournaments & fitness', color: 'from-emerald-500/10 to-teal-500/10' },
  { name: 'Food & Drink', icon: UtensilsCrossed, desc: 'Tastings & festivals', color: 'from-red-500/10 to-coral/10' },
  { name: 'Arts', icon: Sparkles, desc: 'Galleries & exhibitions', color: 'from-blue-500/10 to-indigo-500/10' },
  { name: 'Community', icon: Compass, desc: 'Meetups & gatherings', color: 'from-cyan-500/10 to-sky-500/10' },
  { name: 'Technology', icon: Zap, desc: 'Tech talks & hackathons', color: 'from-violet-500/10 to-purple-500/10' },
  { name: 'Business', icon: CreditCard, desc: 'Conferences & summits', color: 'from-slate-500/10 to-zinc-500/10' }
];

const features = [
  {
    icon: Ticket,
    title: 'Easy & Fast Booking',
    description: 'Select your tickets in seconds with real-time seat availability and instant e-ticket generation.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Online Payments',
    description: 'Industry-standard encryption powered by Razorpay with instant server-side HMAC validation.'
  },
  {
    icon: CreditCard,
    title: 'Flexible Payment Methods',
    description: 'Pay immediately via Razorpay (cards, UPI, netbanking) or choose cash payment confirmed by admin.'
  },
  {
    icon: KeyRound,
    title: 'OTP-Protected Security',
    description: 'Cryptographically hashed one-time codes for registration and password recovery keep accounts safe.'
  }
];

function HomePage() {
  const [events, setEvents] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    getEvents({ limit: 6, sort: 'date_asc' }, controller.signal)
      .then((data) => {
        setEvents(data.events || []);
        setState('ready');
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setState('error');
      });
    return () => controller.abort();
  }, []);

  const featuredEvents = events.slice(0, 3);
  const upcomingEvents = events.slice(3, 6);

  return (
    <main className="overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-24 lg:py-28">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-coral/20 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Copy */}
            <div className="max-w-2xl lg:col-span-7">
              <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-coral backdrop-blur-md">
                <Flame size={14} className="animate-pulse" />
                <span>The Premier Event Platform</span>
              </div>

              <h1 className="animate-fade-up-delay-1 mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
                Find & book <span className="text-coral">amazing</span> events.
              </h1>

              <p className="animate-fade-up-delay-2 mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Discover live concerts, hands-on workshops, sports tournaments, conferences, and memorable
                experiences happening near you.
              </p>

              {/* Action Buttons */}
              <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-sm font-bold text-white shadow-card transition-all duration-300 hover:bg-coral-hover hover:shadow-glow hover:-translate-y-0.5"
                >
                  Explore All Events
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
                >
                  Create Free Account
                </Link>
              </div>

              {/* Value Guarantees */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-coral" />
                  <span>Instant E-Tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-coral" />
                  <span>Verified Venues</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-coral" />
                  <span>Razorpay Protected</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-3 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85"
                    alt="Crowd enjoying an open-air concert"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      Live Experiences
                    </span>
                    <p className="mt-2 font-display text-xl font-bold text-white">
                      Live music, sports & summits
                    </p>
                    <p className="text-xs text-white/75">Curated events for curious minds.</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-coral/20 text-coral">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white">100% Real-Time Availability</p>
                        <p className="text-[11px] text-white/60">Reserve your seats in 2 clicks</p>
                      </div>
                    </div>
                    <Link
                      to="/events"
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-sand"
                    >
                      Browse
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Curated Collections</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Explore by category
            </h2>
            <p className="mt-2 text-sm text-ink/65">Find the exact experience that fits your weekend.</p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-coral transition hover:underline"
          >
            All Categories <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/events?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-ink/10 bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-card"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sand/70 text-coral transition-transform duration-300 group-hover:scale-110 group-hover:bg-coral group-hover:text-white">
                  <Icon size={24} />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-ink transition-colors group-hover:text-coral">
                  {category.name}
                </h3>
                <p className="mt-1 text-[11px] text-ink/50 line-clamp-1">{category.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURED EVENTS SECTION ================= */}
      <section className="border-t border-ink/10 bg-sand/25 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Handpicked</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Featured experiences
              </h2>
              <p className="mt-2 text-sm text-ink/65">Top-rated events generating buzz right now.</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-ink transition hover:text-coral"
            >
              See all events <ArrowRight size={15} />
            </Link>
          </div>

          {/* Event Grid States */}
          <div className="mt-10">
            {state === 'loading' && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            )}

            {state === 'error' && (
              <StateMessage
                type="error"
                title="Events are taking a breather"
                message="We could not load the latest events. Please check your connection and try again."
              />
            )}

            {state === 'ready' && events.length === 0 && (
              <EmptyState
                title="No published events yet"
                message="Events are currently being added. Check back soon for the latest schedule."
              />
            )}

            {state === 'ready' && events.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS SECTION (if more than 3) ================= */}
      {upcomingEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Coming Soon</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">Upcoming on the calendar</h2>
            </div>
            <Link to="/events" className="text-sm font-bold text-coral hover:underline">
              View full schedule
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* ================= WHY CHOOSE EVENTORA ================= */}
      <section className="border-t border-ink/10 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">Why Eventora</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Engineered for seamless event experiences
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">
              From finding tickets to checking in at the door, we make the entire process effortless.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-ink/10 bg-sand/30 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-sand/60 hover:shadow-card"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-coral shadow-xs">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-ink">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink/65">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION BANNER ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white shadow-card sm:px-12 sm:py-16">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-coral">
              <Sparkles size={13} />
              Never Miss A Moment
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">
              Ready to find your next plan?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Explore concerts, creative workshops, food tours, and weekend sports happening all week long.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-full bg-coral px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-coral-hover hover:shadow-glow hover:-translate-y-0.5"
              >
                Browse All Events
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Join Eventora Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
