import { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { changePassword } from '../services/userService';

function SettingsPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmation: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isMinLength = form.newPassword.length >= 8;
  const isMatching =
    form.confirmation.length > 0 && form.newPassword === form.confirmation;
  const isMismatch =
    form.confirmation.length > 0 && form.newPassword !== form.confirmation;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (form.newPassword !== form.confirmation) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setForm({ currentPassword: '', newPassword: '', confirmation: '' });
      toast.success('Password changed successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
          <KeyRound size={14} /> Account Security
        </span>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Security Settings
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage your password and protect your Eventora account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Security Recommendations */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h3 className="font-display font-bold text-ink">Account Protected</h3>
                <p className="text-[11px] text-ink/50">JWT Secure Session</p>
              </div>
            </div>

            <p className="text-xs text-ink/65 leading-relaxed">
              We recommend updating your password periodically to ensure your ticket bookings and payment histories stay safe.
            </p>

            <div className="border-t border-ink/10 pt-4 space-y-2.5 text-xs text-ink/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>At least 8 characters in length</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>Unique password not used elsewhere</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>Contains a mix of letters and numbers</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-sand/30 p-5 text-xs text-ink/70">
            <h4 className="font-bold text-ink">Need Help?</h4>
            <p className="mt-1.5 leading-relaxed">
              If you suspect any unauthorized activity on your account, please change your password immediately and contact Eventora support.
            </p>
          </div>
        </div>

        {/* Right Column: Password Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8 space-y-6"
          >
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">Change Password</h2>
              <p className="text-xs text-ink/50">
                Enter your current password followed by your new chosen password.
              </p>
            </div>

            {user?.authProvider === 'google' && (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-900 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-sky-600 mt-0.5" />
                <div>
                  <p className="font-bold">Signed in with Google</p>
                  <p className="mt-0.5 text-sky-800">
                    Your account is connected via Google ({user.email}). You can sign in anytime using Continue with Google. If you wish to set or reset a local password, you can use the Forgot Password flow.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Current Password <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={form.currentPassword}
                    onChange={(e) => updateField('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-11 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  New Password <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    minLength={8}
                    required
                    value={form.newPassword}
                    onChange={(e) => updateField('newPassword', e.target.value)}
                    placeholder="Create a strong password (min 8 chars)"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-11 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.newPassword && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                      isMinLength ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {isMinLength ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertCircle size={13} />
                    )}
                    <span>
                      {isMinLength
                        ? 'Good length (8+ characters)'
                        : `${8 - form.newPassword.length} more character(s) required`}
                    </span>
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/70"
                >
                  Confirm New Password <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  />
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    minLength={8}
                    required
                    value={form.confirmation}
                    onChange={(e) => updateField('confirmation', e.target.value)}
                    placeholder="Re-type your new password"
                    className="w-full rounded-xl border border-ink/15 bg-sand/10 pl-10 pr-11 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink/35 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isMismatch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                    <AlertCircle size={13} />
                    <span>Passwords do not match</span>
                  </p>
                )}
                {isMatching && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 size={13} />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end border-t border-ink/10 pt-4">
              <button
                type="submit"
                disabled={isSaving || !isMinLength || form.newPassword !== form.confirmation}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral hover:shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={14} />
                    <span>Update Password</span>
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

export default SettingsPage;
