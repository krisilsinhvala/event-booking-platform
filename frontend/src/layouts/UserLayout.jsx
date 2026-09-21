import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Ticket,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const navigation = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/bookings', label: 'My Bookings', icon: Ticket, exact: false },
  { path: '/dashboard/profile', label: 'Profile', icon: User, exact: false },
  { path: '/dashboard/settings', label: 'Security & Settings', icon: Settings, exact: false }
];

function UserLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('eventoraUser') || '{}');

  const logout = () => {
    localStorage.removeItem('eventoraToken');
    localStorage.removeItem('eventoraUser');
    toast.success('Signed out successfully.');
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f7f4ee]">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Mobile Floating Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-ink text-white shadow-card transition-transform hover:scale-105 active:scale-95 lg:hidden"
          aria-label={isOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Backdrop for Mobile Drawer */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-xs transition-opacity lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 flex w-72 flex-col justify-between border-r border-ink/10 bg-white p-6 shadow-card transition-transform duration-300 ease-in-out lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:w-64 lg:translate-x-0 lg:rounded-3xl lg:border lg:border-ink/10 lg:shadow-soft`}
        >
          <div>
            {/* User Profile Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-sand/30 p-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-bold text-white shadow-xs">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{user.name || 'Member'}</p>
                <p className="truncate text-xs text-ink/50">{user.email || 'Verified User'}</p>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="mt-6">
              <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-ink/40">
                Workspace
              </p>
              <nav className="mt-3 space-y-1.5" aria-label="Dashboard navigation">
                {navigation.map(({ path, label, icon: Icon, exact }) => {
                  const isActive = exact
                    ? location.pathname === path
                    : location.pathname.startsWith(path);
                  return (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-ink text-white shadow-xs'
                          : 'text-ink/65 hover:bg-sand hover:text-ink'
                      }`}
                    >
                      <Icon
                        size={17}
                        className={isActive ? 'text-coral' : 'text-ink/50'}
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Quick Link to Browse */}
            <div className="mt-6 border-t border-ink/5 pt-6">
              <Link
                to="/events"
                onClick={closeMenu}
                className="flex items-center gap-2.5 rounded-2xl border border-dashed border-ink/20 px-3.5 py-2.5 text-xs font-bold text-ink/75 transition hover:border-coral hover:bg-coral/5 hover:text-coral"
              >
                <Compass size={15} />
                <span>Explore Live Events</span>
              </Link>
            </div>
          </div>

          {/* Bottom Actions: Sign Out */}
          <div className="border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
