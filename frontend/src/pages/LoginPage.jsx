import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, LogIn, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/authService';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await login(form);
      localStorage.setItem('eventoraToken', data.token);
      localStorage.setItem('eventoraUser', JSON.stringify(data.user));
      toast.success('Welcome back to Eventora!');
      navigate(location.state?.from || (data.user.role === 'admin' ? '/admin' : '/dashboard'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

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
                Welcome Back
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
                Your next great plan awaits.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Sign in to manage your tickets, access booking history, and reserve seats at the latest events.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-coral" />
              <span>Instant booking confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-coral" />
              <span>100% verified tickets with Razorpay</span>
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
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Sign in</h2>
            <p className="mt-2 text-sm text-ink/60">
              Enter your account credentials to access your Eventora space.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/60">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-ink/15 bg-sand/20 py-3 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/15"
                />
              </div>
            </div>

            {/* Password Field with Toggle */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-ink/60">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-coral transition hover:text-coral-dark hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn size={16} />
              {isSubmitting ? 'Signing in...' : 'Sign in to Eventora'}
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

          {/* Google Sign In */}
          <GoogleAuthButton mode="login" />

          {/* Switch to Register */}
          <p className="mt-8 text-center text-sm text-ink/65">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-coral transition hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
