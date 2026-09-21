import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  Ticket,
  TrendingUp,
  Users,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  Building2
} from 'lucide-react';
import StateMessage from '../components/common/StateMessage';
import getAdminDashboard from '../services/adminAnalyticsService';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

function AdminHomePage() {
  const [dashboard, setDashboard] = useState(null);
  const [state, setState] = useState('loading');

  const loadDashboard = () => {
    setState('loading');
    getAdminDashboard()
      .then((data) => {
        setDashboard(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-sand/80" />
        <div className="h-4 w-96 animate-pulse rounded bg-sand/60" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-sand/60" />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error' || !dashboard) {
    return (
      <div className="py-12">
        <StateMessage
          type="error"
          title="Analytics Unavailable"
          message="We could not load the latest administrative dashboard metrics."
          action={
            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-coral"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  const { metrics, revenueTrend } = dashboard;
  const maxRevenue = Math.max(...(revenueTrend || []).map((entry) => entry.revenue), 1);
  const totalBookingsCount = metrics.totalBookings || 1;
  const confirmedPct = Math.round(((metrics.confirmedBookings || 0) / totalBookingsCount) * 100);
  const pendingPct = Math.round(((metrics.pendingBookings || 0) / totalBookingsCount) * 100);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral">
            <Activity size={14} /> Live Platform Intelligence
          </span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Real-time pulse on revenue, reservations, catalogue health, and guest activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-xs transition-colors hover:bg-sand"
          >
            <Ticket size={14} />
            <span>Review Bookings</span>
          </Link>

          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-dark hover:shadow-md"
          >
            <Plus size={15} />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Action alert if pending cash payments exist */}
      {(metrics.pendingCashPayments || 0) > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="font-bold text-amber-900">
                {metrics.pendingCashPayments} Cash Payment(s) Awaiting Confirmation
              </p>
              <p className="text-amber-800/80">
                Guests have chosen cash on arrival. Confirm cash payment upon venue gate arrival.
              </p>
            </div>
          </div>
          <Link
            to="/admin/bookings"
            className="shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 font-bold text-white transition-colors hover:bg-amber-800"
          >
            View Queue
          </Link>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Total Revenue
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {currencyFormatter.format(metrics.totalRevenue || 0)}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2 text-[11px] text-ink/60">
            <span>Online: {currencyFormatter.format(metrics.onlineRevenue || 0)}</span>
            <span>Cash: {currencyFormatter.format(metrics.cashRevenue || 0)}</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Total Bookings
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral/10 text-coral">
              <Ticket size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {numberFormatter.format(metrics.totalBookings || 0)}
          </p>
          <p className="mt-3 border-t border-ink/10 pt-2 text-[11px] text-ink/60">
            {metrics.confirmedBookings || 0} Confirmed • {metrics.pendingBookings || 0} Pending
          </p>
        </div>

        {/* Total Events */}
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Events Catalogue
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {numberFormatter.format(metrics.totalEvents || 0)}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2 text-[11px] text-ink/60">
            <span>Live on platform</span>
            <Link to="/admin/events" className="font-semibold text-coral hover:underline">
              View all
            </Link>
          </div>
        </div>

        {/* Registered Users */}
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-5 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
              Community Size
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {numberFormatter.format(metrics.totalUsers || 0)}
          </p>
          <p className="mt-3 border-t border-ink/10 pt-2 text-[11px] text-ink/60">
            Registered customer accounts
          </p>
        </div>
      </div>

      {/* Middle Grid: Revenue Trend & Booking Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/45">
                <TrendingUp size={14} className="text-coral" />
                <span>Revenue Momentum</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-ink">
                Recent Daily Confirmed Revenue
              </h2>
            </div>
            <span className="rounded-full bg-sand/60 px-3 py-1 text-xs font-semibold text-ink/70">
              Last 7 Days
            </span>
          </div>

          {!revenueTrend || revenueTrend.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-center text-xs text-ink/50">
              Confirmed booking revenue history will populate here automatically.
            </div>
          ) : (
            <div className="mt-8">
              {/* Chart Bars */}
              <div className="flex h-52 items-end gap-3 border-b border-ink/10 pb-2 sm:gap-4">
                {revenueTrend.map((entry) => {
                  const barHeight = Math.max((entry.revenue / maxRevenue) * 100, 4);
                  return (
                    <div
                      key={entry.date}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      {/* Hover Tooltip */}
                      <div className="pointer-events-none absolute -top-10 z-10 hidden -translate-y-1 rounded-lg bg-ink px-2.5 py-1 text-[11px] font-bold text-white shadow-md group-hover:block whitespace-nowrap">
                        {currencyFormatter.format(entry.revenue)}
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-coral to-coral-light transition-all duration-300 group-hover:from-coral-dark group-hover:to-coral"
                        style={{ height: `${barHeight}%` }}
                      />

                      {/* X-axis Date label */}
                      <span className="mt-2 text-[10px] font-semibold text-ink/50">
                        {entry.date ? entry.date.slice(5) : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
                <span>Values shown in Indian Rupee (₹)</span>
                <span>Peak: {currencyFormatter.format(maxRevenue)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Booking Health Card */}
        <div className="rounded-3xl bg-ink p-6 text-white shadow-soft sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sand/60">
              <Activity size={14} className="text-coral" />
              <span>Conversion Audit</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold">Booking Health</h2>
            <p className="mt-1 text-xs text-sand/60">Breakdown of reservation statuses.</p>

            <div className="mt-6 space-y-4">
              {/* Confirmed */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-sand/80">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Confirmed
                  </span>
                  <span className="font-bold text-white">{metrics.confirmedBookings || 0}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${confirmedPct}%` }}
                  />
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-sand/80">
                    <Clock size={15} className="text-amber-400" /> Pending
                  </span>
                  <span className="font-bold text-white">{metrics.pendingBookings || 0}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pendingPct}%` }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-sand/80">
                    <XCircle size={15} className="text-slate-400" /> Cancelled
                  </span>
                  <span className="font-bold text-white">{metrics.cancelledBookings || 0}</span>
                </div>
              </div>

              {/* Rejected */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-sand/80">
                    <AlertCircle size={15} className="text-rose-400" /> Rejected
                  </span>
                  <span className="font-bold text-white">{metrics.rejectedBookings || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/bookings"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink transition-all hover:bg-sand active:scale-98"
          >
            <span>Process Reservations</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
