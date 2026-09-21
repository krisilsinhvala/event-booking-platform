import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  ImagePlus,
  Save,
  Loader2,
  Sparkles,
  Eye,
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAdminEvents, saveAdminEvent } from '../services/adminEventService';
import getMediaUrl from '../utils/media';

const blankForm = {
  title: '',
  description: '',
  category: 'Music',
  date: '',
  time: '',
  venue: '',
  location: '',
  ticketPrice: '',
  totalSeats: '',
  image: '',
  isPublished: false
};

const getErrorMessage = (error) =>
  error.response?.data?.message || 'Unable to save event details.';

function AdminEventFormPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(eventId);

  const [form, setForm] = useState(blankForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [state, setState] = useState(isEditing ? 'loading' : 'ready');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    getAdminEvents()
      .then((events) => {
        const event = (events || []).find((item) => item._id === eventId);
        if (!event) {
          setState('error');
          return;
        }
        setForm({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'Music',
          date: event.date ? event.date.slice(0, 10) : '',
          time: event.time || '',
          venue: event.venue || '',
          location: event.location || '',
          ticketPrice: event.ticketPrice ?? '',
          totalSeats: event.totalSeats ?? '',
          image: event.image || '',
          isPublished: Boolean(event.isPublished)
        });
        if (event.image) {
          setImagePreview(getMediaUrl(event.image));
        }
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [eventId, isEditing]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error('Event title is required.');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.set('image', imageFile);
    }

    try {
      await saveAdminEvent(eventId, formData);
      toast.success(
        isEditing
          ? 'Event updated successfully.'
          : 'Event published to catalogue.'
      );
      navigate('/admin/events');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-sand/80" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-96 animate-pulse rounded-3xl bg-sand/60" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center sm:p-12">
        <p className="font-semibold text-rose-700">The event could not be found or loaded.</p>
        <Link
          to="/admin/events"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-white hover:bg-coral transition-colors"
        >
          <ArrowLeft size={14} /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 transition-colors hover:text-coral"
        >
          <ArrowLeft size={15} />
          <span>Back to Event Catalogue</span>
        </Link>

        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
            <Sparkles size={14} /> {isEditing ? 'Catalogue Editor' : 'New Listing'}
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {isEditing ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {isEditing
              ? 'Update scheduling, pricing, capacity, and cover artwork.'
              : 'Add a new experience to Eventora with ticket pricing and venue information.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (2 Cols): Event Fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information Card */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-5">
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <FileText size={18} className="text-coral" />
                <span>Basic Information</span>
              </h2>
              <p className="text-xs text-ink/50">Primary details shown on search and discovery cards.</p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="event-title"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
              >
                Event Title <span className="text-coral">*</span>
              </label>
              <input
                id="event-title"
                required
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Neon Horizon Music Festival"
                className="w-full rounded-xl border border-ink/15 bg-sand/10 px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="event-category"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
              >
                Category <span className="text-coral">*</span>
              </label>
              <select
                id="event-category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-sand/10 px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
              >
                <option value="Music">Music</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Arts">Arts</option>
                <option value="Community">Community</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
              >
                Description <span className="text-coral">*</span>
              </label>
              <textarea
                id="event-description"
                required
                rows={5}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Provide a compelling overview of what attendees can expect, scheduled performers, what to bring, etc."
                className="w-full resize-y rounded-xl border border-ink/15 bg-sand/10 px-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
              />
            </div>
          </div>

          {/* Schedule & Location Card */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-5">
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <MapPin size={18} className="text-coral" />
                <span>Date, Time & Venue</span>
              </h2>
              <p className="text-xs text-ink/50">Where and when attendees should arrive.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Date */}
              <div>
                <label
                  htmlFor="event-date"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Event Date <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label
                  htmlFor="event-time"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Door / Start Time <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-time"
                    type="text"
                    required
                    value={form.time}
                    onChange={(e) => updateField('time', e.target.value)}
                    placeholder="7:00 PM"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label
                  htmlFor="event-venue"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Venue Name <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-venue"
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => updateField('venue', e.target.value)}
                    placeholder="The Grand Amphitheater"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="event-location"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  City & State <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-location"
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Capacity Card */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-5">
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <IndianRupee size={18} className="text-coral" />
                <span>Ticketing & Capacity</span>
              </h2>
              <p className="text-xs text-ink/50">Seat quotas and unit ticket pricing.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Ticket Price */}
              <div>
                <label
                  htmlFor="event-price"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Ticket Price (₹ INR) <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.ticketPrice}
                    onChange={(e) => updateField('ticketPrice', e.target.value)}
                    placeholder="499"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink/45">
                  Enter 0 for free events.
                </p>
              </div>

              {/* Total Seats */}
              <div>
                <label
                  htmlFor="event-seats"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Total Seats Available <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="event-seats"
                    type="number"
                    min="1"
                    required
                    value={form.totalSeats}
                    onChange={(e) => updateField('totalSeats', e.target.value)}
                    placeholder="150"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media, Publishing & Actions */}
        <div className="space-y-6">
          {/* Media Upload Card with Live Preview */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display font-bold text-ink">Cover Artwork</h3>
            <p className="text-xs text-ink/50">
              High resolution landscape image (16:9 recommended).
            </p>

            {/* Preview Box */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-ink/10 bg-sand">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-ink/40">
                  <ImagePlus size={32} />
                  <p className="mt-2 text-xs font-medium">No image selected</p>
                </div>
              )}
            </div>

            {/* File Input */}
            <label
              htmlFor="event-image"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/15 bg-sand/20 p-4 text-center transition-colors hover:border-coral hover:bg-sand/40"
            >
              <ImagePlus size={20} className="text-coral" />
              <span className="mt-1 text-xs font-bold text-ink">
                {imageFile ? imageFile.name : 'Choose image file'}
              </span>
              <span className="text-[11px] text-ink/45">PNG, JPG or WebP up to 5 MB</span>
              <input
                id="event-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Publishing Settings */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display font-bold text-ink">Visibility</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => updateField('isPublished', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-coral"
              />
              <div className="text-xs">
                <span className="font-bold text-ink block">
                  Publish to Live Catalogue
                </span>
                <span className="text-ink/50 mt-0.5 block leading-relaxed">
                  When enabled, this event immediately appears on public search, discovery feeds, and home page carousels.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral hover:shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>{isEditing ? 'Save Changes' : 'Publish Event'}</span>
                </>
              )}
            </button>

            <Link
              to="/admin/events"
              className="block text-center rounded-xl border border-ink/15 py-2.5 text-xs font-semibold text-ink/70 hover:bg-sand transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminEventFormPage;
