import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home, Calendar, Sparkles } from 'lucide-react';

function NotFoundPage() {
  const popularCategories = ['Music', 'Workshop', 'Sports', 'Food & Drink', 'Arts'];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      {/* 404 Visual Icon */}
      <div className="relative">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-sand/60 text-coral shadow-soft sm:h-28 sm:w-28">
          <Compass size={56} className="animate-spin-slow" />
        </div>
        <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-xl bg-ink font-mono text-xs font-bold text-white shadow-md">
          404
        </span>
      </div>

      <div className="mt-8 max-w-lg">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
          <Sparkles size={14} /> Lost in Transit
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          That page wandered off.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">
          The link you followed may be expired or mistyped. Don&apos;t worry—there are dozens of incredible events happening right now.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-coral px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-dark hover:shadow-md active:scale-98"
        >
          <Calendar size={15} />
          <span>Explore Events</span>
          <ArrowRight size={14} />
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-5 py-3 text-xs font-bold text-ink shadow-xs transition-colors hover:bg-sand active:scale-98"
        >
          <Home size={15} />
          <span>Back to Homepage</span>
        </Link>
      </div>

      {/* Popular category quick jump chips */}
      <div className="mt-12 border-t border-ink/10 pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
          Or jump straight into popular categories:
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {popularCategories.map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${encodeURIComponent(cat)}`}
              className="rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 shadow-xs transition-all hover:border-coral hover:text-coral hover:bg-sand/30"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
