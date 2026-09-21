import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck, Banknote, CreditCard } from 'lucide-react';

const badgeConfig = {
  confirmed: {
    label: 'Confirmed',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: CheckCircle2
  },
  paid: {
    label: 'Paid',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: ShieldCheck
  },
  pending: {
    label: 'Pending',
    style: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: Clock
  },
  cancelled: {
    label: 'Cancelled',
    style: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: XCircle
  },
  rejected: {
    label: 'Rejected',
    style: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: AlertCircle
  },
  failed: {
    label: 'Failed',
    style: 'bg-rose-50 text-rose-700 border-rose-200/80',
    icon: AlertCircle
  },
  online: {
    label: 'Online',
    style: 'bg-blue-50 text-blue-700 border-blue-200/80',
    icon: CreditCard
  },
  cash: {
    label: 'Cash',
    style: 'bg-purple-50 text-purple-700 border-purple-200/80',
    icon: Banknote
  },
  published: {
    label: 'Published',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: CheckCircle2
  },
  draft: {
    label: 'Draft',
    style: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Clock
  }
};

function Badge({ status, text, size = 'sm', showIcon = true, className = '' }) {
  const normalized = (status || '').toLowerCase().trim();
  const config = badgeConfig[normalized] || {
    label: text || status || 'Unknown',
    style: 'bg-sand text-ink/70 border-ink/10',
    icon: null
  };

  const IconComponent = config.icon;
  const label = text || config.label;
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide capitalize shadow-xs transition-colors ${config.style} ${sizeClasses} ${className}`}
    >
      {showIcon && IconComponent && <IconComponent size={size === 'xs' ? 12 : 13} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

export default Badge;
