import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Compass,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  UserPlus,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const navLinkClass = ({ isActive }) =>
  `relative px-3.5 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
    isActive
      ? 'bg-ink text-white shadow-xs'
      : 'text-ink/70 hover:text-ink hover:bg-black/5'
  }`;

function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user session
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');
  const token = localStorage.getItem('eventoraToken');
  const isAuthenticated = Boolean(token && user.email);
  const isAdmin = user.role === 'admin';
  const accountPath = isAdmin ? '/admin' : '/dashboard';

  // Only show secondary search bar on discovery pages
  const isDiscoveryPage = location.pathname === '/' || location.pathname === '/events';

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      navigate('/events');
      return;
    }
    navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('eventoraToken');
    localStorage.removeItem('eventoraUser');
    toast.success('Signed out successfully.');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ee] text-ink antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-[#f7f4ee]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-coral shadow-xs transition-transform duration-300 group-hover:scale-105 group-hover:bg-coral group-hover:text-white">
              <CalendarDays size={20} aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight">Eventora</span>
              <span className="-mt-1 text-[10px] font-bold uppercase tracking-widest text-coral">
                Book Moments
              </span>
            </span>
          </Link>

          {/* Inline Search for Desktop (on discovery pages) */}
          {isDiscoveryPage && (
            <form onSubmit={submitSearch} className="hidden md:flex max-w-md flex-1 items-center mx-4">
              <div className="relative w-full">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
                  size={17}
                  aria-hidden="true"
                />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search events, venues, or cities..."
                  className="w-full rounded-full border border-ink/10 bg-white/80 py-2 pl-10 pr-4 text-sm text-ink placeholder-ink/40 outline-none ring-coral/25 transition focus:bg-white focus:ring-4 focus:border-coral"
                  aria-label="Search events"
                />
              </div>
            </form>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-2 text-sm font-medium lg:flex" aria-label="Main navigation">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Explore Events
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <NavLink to="/dashboard/bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
            )}
            {isAuthenticated && isAdmin && (
              <NavLink to="/admin/events" className={navLinkClass}>
                Catalogue
              </NavLink>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              /* User Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2.5 rounded-full border border-ink/15 bg-white py-1.5 pl-2 pr-3 text-sm font-semibold shadow-2xs transition hover:border-ink/30 hover:bg-sand/40"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink font-bold text-white text-xs">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="max-w-[120px] truncate text-ink">{user.name?.split(' ')[0] || 'Account'}</span>
                  {isAdmin && (
                    <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral">
                      Admin
                    </span>
                  )}
                  <ChevronDown size={14} className="text-ink/50" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-ink/10 bg-white p-2 shadow-card backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="border-b border-ink/5 px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-ink/50">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={accountPath}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-sand hover:text-ink"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} className="text-coral" />
                        {isAdmin ? 'Admin Dashboard' : 'Dashboard Overview'}
                      </Link>

                      {!isAdmin && (
                        <Link
                          to="/dashboard/bookings"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-sand hover:text-ink"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Ticket size={16} className="text-coral" />
                          My Bookings
                        </Link>
                      )}

                      <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-sand hover:text-ink"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} className="text-coral" />
                        Profile
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-sand hover:text-ink"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} className="text-coral" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-ink/5 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink/80 transition hover:bg-black/5 hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-coral-hover hover:shadow-glow"
                >
                  <UserPlus size={15} />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 bg-white text-ink shadow-2xs md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="border-t border-ink/10 bg-white px-5 py-6 shadow-card md:hidden">
            {/* Mobile Search */}
            <form onSubmit={submitSearch} className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search events, places, or dates..."
                className="w-full rounded-xl border border-ink/15 bg-sand/30 py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-coral"
              />
            </form>

            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                    isActive ? 'bg-ink text-white' : 'text-ink/75 hover:bg-sand'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <Compass size={18} /> Home
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                    isActive ? 'bg-ink text-white' : 'text-ink/75 hover:bg-sand'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles size={18} /> Explore Events
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink
                    to={accountPath}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                        isActive ? 'bg-ink text-white' : 'text-ink/75 hover:bg-sand'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard Overview'}
                  </NavLink>

                  {!isAdmin && (
                    <NavLink
                      to="/dashboard/bookings"
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                          isActive ? 'bg-ink text-white' : 'text-ink/75 hover:bg-sand'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Ticket size={18} /> My Bookings
                    </NavLink>
                  )}

                  <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                        isActive ? 'bg-ink text-white' : 'text-ink/75 hover:bg-sand'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} /> Profile
                  </NavLink>

                  <div className="mt-4 border-t border-ink/10 pt-4">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={18} /> Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-2 border-t border-ink/10 pt-4">
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 py-3 text-sm font-bold text-ink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={17} /> Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 rounded-xl bg-coral py-3 text-sm font-bold text-white shadow-xs"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus size={17} /> Create free account
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Routed Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Professional Footer */}
      <footer className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand & Mission */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 text-lg font-bold">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-coral">
                  <CalendarDays size={18} aria-hidden="true" />
                </span>
                <span className="font-display text-2xl font-bold tracking-tight">Eventora</span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/65">
                The modern event booking platform. Discover concerts, workshops, community gatherings, and
                extraordinary experiences happening all around you.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink/75">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={14} /> 100% Verified Tickets
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700 border border-blue-200">
                  <CreditCard size={14} /> Razorpay Secure
                </span>
              </div>
            </div>

            {/* Column 1: Discover */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/40">Discover</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-ink/70">
                <li>
                  <Link to="/events" className="transition hover:text-coral">
                    All Events
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Music" className="transition hover:text-coral">
                    Music & Concerts
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Workshop" className="transition hover:text-coral">
                    Workshops & Classes
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Sports" className="transition hover:text-coral">
                    Sports & Fitness
                  </Link>
                </li>
                <li>
                  <Link to="/events?category=Food%20%26%20Drink" className="transition hover:text-coral">
                    Food & Drink
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Account & Bookings */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/40">Account</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-ink/70">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/dashboard" className="transition hover:text-coral">
                        Your Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/bookings" className="transition hover:text-coral">
                        My Bookings
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/profile" className="transition hover:text-coral">
                        Profile & Settings
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link to="/admin" className="font-bold text-coral transition hover:underline">
                          Admin Workspace
                        </Link>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="transition hover:text-coral">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="transition hover:text-coral">
                        Create Account
                      </Link>
                    </li>
                    <li>
                      <Link to="/forgot-password" className="transition hover:text-coral">
                        Forgot Password
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Column 3: Platform Features */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/40">Why Eventora</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-ink/70">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-coral" /> Instant E-Tickets
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-coral" /> Real-Time Seat Count
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-coral" /> Online & Cash Payment
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-coral" /> OTP Security
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-8 text-xs text-ink/50 sm:flex-row">
            <p>© 2026 Eventora Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with <Heart size={13} className="text-coral fill-coral inline" /> for event lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
