import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword, resetPassword } from '../services/authService';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown === 0) return undefined;
    const timer = window.setInterval(
      () => setCooldown((seconds) => Math.max(seconds - 1, 0)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleRequestCode = async (event) => {
    event.preventDefault();
    if (!form.email.trim()) {
      toast.error('Please enter your account email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword({ email: form.email.trim() });
      setCodeSent(true);
      setCooldown(60);
      toast.success('If an account exists, a 6-digit reset code has been sent to your email.');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset code.';
      const remainingSeconds = message.match(/(\d+)\s*seconds?/i)?.[1];
      if (remainingSeconds) setCooldown(Number(remainingSeconds));
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (form.password.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        email: form.email.trim(),
        otp: form.otp.trim(),
        password: form.password
      });
      toast.success('Password reset successfully! You can now sign in with your new password.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password. Check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 shadow-card sm:p-10">
        {/* Back Link */}
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-ink/60 transition hover:text-coral"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>

        {/* Icon & Title */}
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral/10 text-coral">
          <KeyRound size={24} />
        </div>

        <h1 className="mt-5 font-display text-3xl font-bold text-ink sm:text-4xl">
          {codeSent ? 'Enter reset code' : 'Reset your password'}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          {codeSent ? (
            <span>
              We sent a 6-digit code to <strong className="text-ink">{form.email}</strong>. Enter the
              code below along with your new password.
            </span>
          ) : (
            'Enter the email address registered with Eventora, and we will dispatch a secure 6-digit verification code.'
          )}
        </p>

        {/* Form */}
        <form onSubmit={codeSent ? handleResetPassword : handleRequestCode} className="mt-8 space-y-5">
          {/* Email input */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                Account Email
              </label>
              {codeSent && (
                <button
                  type="button"
                  onClick={() => setCodeSent(false)}
                  className="text-xs font-semibold text-coral hover:underline"
                >
                  Change email
                </button>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
              <input
                id="reset-email"
                type="email"
                required
                disabled={codeSent}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
                className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition ${
                  codeSent
                    ? 'border-ink/10 bg-sand/40 text-ink/60'
                    : 'border-ink/15 bg-sand/20 text-ink focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15'
                }`}
              />
            </div>
          </div>

          {/* OTP Code and New Password Fields (Step 2) */}
          {codeSent && (
            <>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="reset-otp" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                    6-Digit Verification Code
                  </label>
                  {cooldown > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-ink/50">
                      <Clock size={12} /> Resend in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestCode}
                      className="flex items-center gap-1 text-xs font-bold text-coral hover:underline"
                    >
                      <RotateCcw size={12} /> Resend code
                    </button>
                  )}
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                  <input
                    id="reset-otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={form.otp}
                    onChange={(event) => setForm({ ...form, otp: event.target.value.replace(/\D/g, '') })}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-3 pl-10 pr-4 font-mono text-base font-bold tracking-widest text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-3 pl-10 pr-11 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirm-new-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-3 pl-10 pr-11 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || (!codeSent && cooldown > 0)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : codeSent
              ? 'Update & Reset Password'
              : cooldown > 0
              ? `Try again in ${cooldown}s`
              : 'Send 6-digit code'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
