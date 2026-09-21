import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  SlidersHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { deleteAdminEvent, getAdminEvents, toggleAdminEvent } from '../services/adminEventService';
import getMediaUrl from '../utils/media';

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

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [state, setState] = useState('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadEvents = () => {
    setState('loading');
    getAdminEvents()
      .then((result) => {
        setEvents(result || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this event'}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(eventId);
    try {
      await deleteAdminEvent(eventId);
      setEvents((current) => current.filter((event) => event._id !== eventId));
      toast.success('Event deleted from catalogue.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (eventId) => {
    setTogglingId(eventId);
    try {
      const updatedEvent = await toggleAdminEvent(eventId);
      setEvents((current) =>
        current.map((event) => (event._id === eventId ? updatedEvent : event))
      );
      toast.success(
        updatedEvent.isPublished
          ? 'Event published to public calendar.'
          : 'Event changed to draft mode.'
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update event status.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const title = e.title?.toLowerCase() || '';
      const venue = e.venue?.toLowerCase() || '';
      const category = e.category || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch = !q || title.includes(q) || venue.includes(q);
      const matchesCategory = !categoryFilter || category === categoryFilter;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'published' ? e.isPublished : !e.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, categoryFilter, statusFilter]);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-4 w-96 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 h-96 animate-pulse rounded-3xl bg-sand/60" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center sm:p-12">
        <p className="font-semibold text-rose-700">Unable to load the admin event catalogue.</p>
        <button
          onClick={loadEvents}
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
            <CalendarDays size={14} /> Catalogue Management
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Manage Events
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {events.length} event{events.length === 1 ? '' : 's'} registered in your catalogue.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-dark hover:shadow-md"
        >
          <Plus size={15} />
          <span>Create New Event</span>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-ink/10 bg-white p-8 sm:p-12">
          <EmptyState
            title="Catalogue is empty"
            message="Create your first event to start publishing listings to the public calendar."
            action={
              <Link
                to="/admin/events/new"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-coral px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-coral-dark hover:shadow-lg"
              >
                <Plus size={16} />
                <span>Create First Event</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Controls bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event title or venue..."
                className="w-full rounded-xl border border-ink/15 bg-sand/20 pl-10 pr-4 py-2 text-xs text-ink outline-none transition-all placeholder:text-ink/40 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-ink/15 bg-sand/20 px-3.5 py-2 text-xs font-medium text-ink outline-none transition-colors focus:border-coral focus:bg-white"
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Workshop">Workshop</option>
              <option value="Sports">Sports</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Arts">Arts</option>
              <option value="Community">Community</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-ink/15 bg-sand/20 px-3.5 py-2 text-xs font-medium text-ink outline-none transition-colors focus:border-coral focus:bg-white"
            >
              <option value="">All Visibility</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Events Data Table */}
          {filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
              <EmptyState
                title="No matching events"
                message="Try adjusting your search criteria or resetting filters."
                action={
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('');
                      setStatusFilter('');
                    }}
                    className="rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold text-ink hover:bg-sand transition-colors"
                  >
                    Reset Filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ink/10 bg-sand/40 text-[11px] font-bold uppercase tracking-wider text-ink/50">
                    <tr>
                      <th className="px-5 py-4">Event Details</th>
                      <th className="px-5 py-4">Schedule & Venue</th>
                      <th className="px-5 py-4">Capacity & Price</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {filteredEvents.map((event) => {
                      const seatPct = Math.round(
                        ((event.availableSeats || 0) / (event.totalSeats || 1)) * 100
                      );

                      return (
                        <tr
                          key={event._id}
                          className="transition-colors hover:bg-sand/20"
                        >
                          {/* Event Thumbnail & Title */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand">
                                {event.image ? (
                                  <img
                                    src={getMediaUrl(event.image)}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-ink/40">
                                    <ImageIcon size={18} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="truncate font-display text-sm font-bold text-ink">
                                  {event.title}
                                </p>
                                <span className="inline-block rounded-md bg-sand/80 px-2 py-0.5 text-[10px] font-bold uppercase text-ink/60">
                                  {event.category || 'General'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Schedule & Venue */}
                          <td className="px-5 py-4">
                            <div className="space-y-1 text-ink/70">
                              <div className="flex items-center gap-1.5 font-medium">
                                <CalendarDays size={13} className="text-coral shrink-0" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-ink/50">
                                <Clock size={12} className="shrink-0" />
                                <span>{event.time || 'TBA'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-ink/50 truncate max-w-xs">
                                <MapPin size={12} className="shrink-0" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                            </div>
                          </td>

                          {/* Capacity & Price */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <p className="font-bold text-ink">
                                {formatPrice(event.ticketPrice)}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-ink/60">
                                <span>
                                  {event.availableSeats} / {event.totalSeats} seats
                                </span>
                              </div>
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-sand">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    seatPct < 20 ? 'bg-rose-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${seatPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Visibility Toggle Button */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              disabled={togglingId === event._id}
                              onClick={() => handleToggle(event._id)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                                event.isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {event.isPublished ? (
                                <Eye size={13} className="text-emerald-600" />
                              ) : (
                                <EyeOff size={13} />
                              )}
                              <span>{event.isPublished ? 'Published' : 'Draft'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Public view */}
                              <Link
                                to={`/events/${event._id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/60 transition-colors hover:bg-sand hover:text-ink"
                                title="Preview Public Page"
                              >
                                <ExternalLink size={14} />
                              </Link>

                              {/* Edit */}
                              <Link
                                to={`/admin/events/${event._id}/edit`}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/60 transition-colors hover:bg-sand hover:text-ink"
                                title="Edit Event"
                              >
                                <Edit3 size={14} />
                              </Link>

                              {/* Delete */}
                              <button
                                type="button"
                                disabled={deletingId === event._id}
                                onClick={() => handleDelete(event._id, event.title)}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                                title="Delete Event"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminEventsPage;
