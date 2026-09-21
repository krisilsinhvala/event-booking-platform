import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ListPlus,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Compass,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
    isActive
      ? 'bg-ink text-white shadow-sm'
      : 'text-ink/60 hover:bg-sand hover:text-ink'
  }`;

function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');

  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    localStorage.removeItem('eventoraToken');
    localStorage.removeItem('eventoraUser');
    navigate('/login');
  };

  const navigation = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/admin/events', label: 'Event Catalogue', icon: CalendarDays, exact: false },
    { path: '/admin/events/new', label: 'Create Event', icon: ListPlus, exact: false },
    { path: '/admin/bookings', label: 'Manage Bookings', icon: ClipboardList, exact: false }
  ];

  const initials = (user.name || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#FAF8F5]">
      {/* Mobile drawer toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-ink text-white shadow-card transition-transform active:scale-95 lg:hidden"
        aria-label={isOpen ? 'Close admin menu' : 'Open admin menu'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={closeMenu}
          aria-label="Close admin menu"
        />
      )}

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Admin Sidebar */}
        <aside
          className={`${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-72 border-r border-ink/10 bg-white p-6 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:block lg:w-64 lg:shrink-0 lg:rounded-3xl lg:border lg:bg-white lg:p-5 lg:shadow-soft lg:translate-x-0`}
        >
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-5">
            <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-base font-bold text-coral shadow-xs">
                E
              </span>
              <div>
                <span className="font-display text-base font-bold tracking-tight text-ink">
                  EVENTORA
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-coral">
                  Control Center
                </span>
              </div>
            </Link>

            <button
              onClick={closeMenu}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 hover:bg-sand lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Admin User Card */}
          <div className="my-5 flex items-center gap-3 rounded-2xl bg-sand/40 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-bold text-xs text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">{user.name || 'Admin User'}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck size={11} /> Superadmin
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink/40">
            Workspace Navigation
          </p>
          <nav className="space-y-1">
            {navigation.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                className={linkClass}
                onClick={closeMenu}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </NavLink>
            ))}
          </nav>

          {/* Secondary Actions */}
          <div className="mt-8 border-t border-ink/10 pt-5 space-y-1">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-ink/40">
              Quick Links
            </p>

            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-ink/65 transition-colors hover:bg-sand hover:text-ink"
            >
              <Compass size={16} />
              <span>Public Live Site</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Admin Content Viewport */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
