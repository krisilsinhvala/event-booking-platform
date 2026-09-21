import {
  Calendar,
  DollarSign,
  Filter,
  Music,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import StateMessage from '../components/common/StateMessage';
import EventCard from '../components/events/EventCard';
import EventCardSkeleton from '../components/events/EventCardSkeleton';
import { getEvents } from '../services/eventService';

const categories = ['Music', 'Workshop', 'Sports', 'Food & Drink', 'Arts', 'Community', 'Technology', 'Business'];

const initialFilters = {
  search: '',
  category: '',
  date: '',
  minPrice: '',
  maxPrice: '',
  sort: 'date_asc'
};

function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || ''
  }));

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [state, setState] = useState('loading');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Sync URL search params with filters state on change
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    if (urlCategory !== null || urlSearch !== null) {
      setFilters((current) => ({
        ...current,
        category: urlCategory || '',
        search: urlSearch || ''
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const requestParams = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== null)
    );

    setState('loading');
    getEvents({ ...requestParams, limit: 12 }, controller.signal)
      .then((data) => {
        setEvents(data.events || []);
        setPagination(data.pagination);
        setState('ready');
      })
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setState('error');
      });

    return () => controller.abort();
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => {
      const updated = { ...current, [key]: value };
      // Keep searchParams in sync for category and search
      if (key === 'category' || key === 'search') {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
        setSearchParams(newParams, { replace: true });
      }
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams({});
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort'
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Page Header */}
      <PageHeader
        badge="Catalogue"
        title="Explore all events"
        subtitle="Browse live music, workshops, culinary tastings, and outdoor adventures."
      />

      {/* Quick Category Chips */}
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          type="button"
          onClick={() => updateFilter('category', '')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            filters.category === ''
              ? 'bg-ink text-white shadow-xs'
              : 'border border-ink/10 bg-white text-ink/75 hover:bg-sand/60 hover:text-ink'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              filters.category === cat
                ? 'bg-coral text-white shadow-xs'
                : 'border border-ink/10 bg-white text-ink/75 hover:bg-sand/60 hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Filter & Grid Container */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((open) => !open)}
            className="flex items-center gap-2 rounded-2xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold shadow-2xs"
          >
            <SlidersHorizontal size={16} />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <span className="text-xs font-semibold text-ink/55">
            {pagination ? `${pagination.totalEvents} events found` : 'Loading...'}
          </span>
        </div>

        {/* Filter Sidebar */}
        <aside
          className={`${
            isFiltersOpen ? 'block' : 'hidden'
          } rounded-3xl border border-ink/10 bg-white p-6 shadow-soft lg:block lg:sticky lg:top-24 lg:h-fit`}
        >
          <div className="mb-6 flex items-center justify-between border-b border-ink/5 pb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Filter size={16} className="text-coral" />
              Filter Events
            </h2>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-bold text-coral hover:underline"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Search Input */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50" htmlFor="filter-search">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={15} />
                <input
                  id="filter-search"
                  type="text"
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  placeholder="Title, venue, city..."
                  className="w-full rounded-xl border border-ink/15 bg-sand/20 py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus:border-coral focus:bg-white"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50" htmlFor="filter-date">
                Date
              </label>
              <div className="relative">
                <input
                  id="filter-date"
                  type="date"
                  value={filters.date}
                  onChange={(event) => updateFilter('date', event.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-sand/20 py-2.5 px-3 text-sm text-ink outline-none focus:border-coral focus:bg-white"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50">
                Price Range (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter('minPrice', event.target.value)}
                  placeholder="Min ₹"
                  className="w-full rounded-xl border border-ink/15 bg-sand/20 py-2 px-3 text-sm text-ink outline-none focus:border-coral focus:bg-white"
                  aria-label="Minimum price in rupees"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter('maxPrice', event.target.value)}
                  placeholder="Max ₹"
                  className="w-full rounded-xl border border-ink/15 bg-sand/20 py-2 px-3 text-sm text-ink outline-none focus:border-coral focus:bg-white"
                  aria-label="Maximum price in rupees"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50" htmlFor="filter-sort">
                Sort By
              </label>
              <select
                id="filter-sort"
                value={filters.sort}
                onChange={(event) => updateFilter('sort', event.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-sand/20 py-2.5 px-3 text-sm font-medium text-ink outline-none focus:border-coral focus:bg-white"
              >
                <option value="date_asc">Soonest date first</option>
                <option value="date_desc">Latest date first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile Apply Filters Action */}
            <div className="pt-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="w-full rounded-2xl bg-ink py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral"
              >
                Apply Filters {pagination?.totalEvents ? `(${pagination.totalEvents} Events)` : ''}
              </button>
            </div>
          </div>
        </aside>

        {/* Events Content Area */}
        <section aria-live="polite" className="min-w-0">
          {/* Header Bar */}
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm font-semibold text-ink/65">
              {pagination ? (
                <span>
                  Showing <strong className="text-ink">{pagination.totalEvents}</strong> events
                </span>
              ) : (
                'Discovering events...'
              )}
            </p>

            {/* Active filter badges */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral">
                    {filters.category}
                    <button type="button" onClick={() => updateFilter('category', '')} aria-label="Remove category filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink/10 px-2.5 py-1 text-xs font-bold text-ink">
                    "{filters.search}"
                    <button type="button" onClick={() => updateFilter('search', '')} aria-label="Remove search filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filters.date && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-bold text-ink">
                    Date: {filters.date}
                    <button type="button" onClick={() => updateFilter('date', '')} aria-label="Remove date filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {state === 'loading' && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <StateMessage
              type="error"
              title="We could not load events"
              message="The event service is currently unavailable. Please check your connection and try again."
            />
          )}

          {/* Empty State */}
          {state === 'ready' && events.length === 0 && (
            <EmptyState
              title="No events found"
              message="No events match your current filter criteria. Try clearing some filters or searching for something else."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-coral"
                >
                  Clear all filters
                </button>
              }
            />
          )}

          {/* Events Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          {state === 'ready' && events.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventsPage;
