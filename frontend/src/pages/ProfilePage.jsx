import { useEffect, useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Image as ImageIcon,
  Mail,
  ShieldCheck,
  Save,
  Loader2,
  Sparkles,
  Camera
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from '../services/userService';

function ProfilePage() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', avatar: '' });
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [state, setState] = useState('loading');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((user) => {
        setForm({
          name: user.name || '',
          phone: user.profile?.phone || '',
          address: user.profile?.address || '',
          avatar: user.profile?.avatar || ''
        });
        setUserEmail(user.email || '');
        setUserRole(user.role || 'user');
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Full name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateProfile(form);
      // Update localStorage so layouts reflect the updated profile
      const stored = JSON.parse(localStorage.getItem('eventoraUser') || '{}');
      const merged = { ...stored, ...updatedUser };
      localStorage.setItem('eventoraUser', JSON.stringify(merged));
      // Dispatch storage event to notify layouts
      window.dispatchEvent(new Event('storage'));

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-4 w-72 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl bg-sand/60" />
          <div className="h-96 animate-pulse rounded-3xl bg-sand/60 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-8 text-center sm:p-12">
        <p className="font-semibold text-rose-700">We could not load your profile details.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-white hover:bg-coral transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const initials = (form.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
          <Sparkles size={14} /> Personal Profile
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Your Profile
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage your personal information, contact numbers, and profile photo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Summary Card */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-ink/10 bg-white p-6 text-center shadow-soft">
            <div className="relative mx-auto h-28 w-28">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={form.name || 'Profile'}
                  className="h-full w-full rounded-full border-4 border-sand object-cover shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'grid';
                  }}
                />
              ) : null}
              <div
                style={{ display: form.avatar ? 'none' : 'grid' }}
                className="grid h-full w-full place-items-center rounded-full border-4 border-sand bg-gradient-to-br from-coral to-coral-dark text-3xl font-bold text-white shadow-sm"
              >
                {initials}
              </div>

              <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-white shadow-md">
                <Camera size={14} />
              </span>
            </div>

            <h2 className="mt-4 font-display text-xl font-bold text-ink">
              {form.name || 'Eventora Explorer'}
            </h2>
            <p className="text-xs text-ink/60">{userEmail}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck size={12} /> Active Account
              </span>
              <span className="inline-flex items-center rounded-full bg-sand/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-ink/70">
                {userRole}
              </span>
            </div>
          </div>

          {/* Quick tips card */}
          <div className="rounded-3xl border border-ink/10 bg-sand/30 p-5 text-xs text-ink/70">
            <h3 className="font-bold text-ink">Profile Picture Tip</h3>
            <p className="mt-1.5 leading-relaxed">
              Paste a public image URL from Unsplash, Gravatar, or Cloudinary. A 400×400 square image gives the best quality across your tickets and badges.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-6"
          >
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">Account Details</h2>
              <p className="text-xs text-ink/50">Update how your info appears on ticket receipts.</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Full Name <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="profile-name"
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full cursor-not-allowed rounded-xl border border-ink/10 bg-sand/40 pl-10 pr-4 py-2.5 text-sm text-ink/60 outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink/45">
                  Your registered email address cannot be changed directly.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink/45">
                  Used to send SMS booking reminders and gate entry notifications.
                </p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="profile-address" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Address / City
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-3.5 text-ink/40"
                  />
                  <textarea
                    id="profile-address"
                    rows={3}
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Flat 4B, Emerald Residency, Mumbai, Maharashtra 400001"
                    className="w-full resize-none rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label htmlFor="profile-avatar" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Avatar Image URL
                </label>
                <div className="relative">
                  <ImageIcon
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="profile-avatar"
                    type="url"
                    value={form.avatar}
                    onChange={(e) => updateField('avatar', e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-4 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end border-t border-ink/10 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral hover:shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
