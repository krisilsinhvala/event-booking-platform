import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../services/authService';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    // Client-side validations
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card md:grid-cols-12">
        {/* Left Visual Column (Desktop) */}
        <div className="hidden bg-ink p-10 text-white md:col-span-5 md:flex md:flex-col md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <div className="mt-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-coral">
                <Sparkles size={12} />
                Get Started
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
                Join our community of event goers.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Unlock seamless event reservations, e-tickets, personalized recommendations, and easy booking management.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-coral" />
              <span>Zero booking subscription fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-coral" />
              <span>Safe payment with Razorpay & Cash</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-7 sm:p-10 md:col-span-7">
          {/* Mobile Back Button */}
          <div className="mb-6 md:hidden">
            <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-coral">
              <ArrowLeft size={14} /> Back to events
            </Link>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Create account</h2>
            <p className="mt-2 text-sm text-ink/60">
              Fill in your details below to start reserving tickets in minutes.
            </p>
          </div>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="register-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="register-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition focus:bg-white focus:ring-4 ${
                    form.confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-500 bg-emerald-50/20 focus:ring-emerald-500/15'
                        : 'border-rose-500 bg-rose-50/20 focus:ring-rose-500/15'
                      : 'border-ink/15 bg-sand/20 focus:border-coral focus:ring-coral/15'
                  }`}
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
              {form.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-rose-600">Passwords do not match yet.</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={16} />
              {isSubmitting ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-bold tracking-wider text-ink/40">OR</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <GoogleAuthButton mode="register" />

          {/* Switch to Sign In */}
          <p className="mt-6 text-center text-sm text-ink/65">
            Already have an Eventora account?{' '}
            <Link to="/login" className="font-bold text-coral transition hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
