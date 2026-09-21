import { AlertCircle, SearchX, HelpCircle, Info } from 'lucide-react';

function StateMessage({ type = 'empty', title, message, action, className = '' }) {
  const isError = type === 'error';
  const isInfo = type === 'info';

  const iconConfig = {
    error: {
      icon: AlertCircle,
      wrapperClass: 'bg-rose-50 text-rose-600 border border-rose-200/80',
      borderClass: 'border-rose-200/80 bg-rose-50/30'
    },
    info: {
      icon: Info,
      wrapperClass: 'bg-blue-50 text-blue-600 border border-blue-200/80',
      borderClass: 'border-blue-200/80 bg-blue-50/30'
    },
    empty: {
      icon: SearchX,
      wrapperClass: 'bg-sand/60 text-ink/70 border border-ink/10',
      borderClass: 'border-ink/10 bg-white'
    }
  };

  const current = iconConfig[type] || iconConfig.empty;
  const IconComponent = current.icon;

  return (
    <div
      className={`col-span-full flex min-h-64 flex-col items-center justify-center rounded-3xl border ${current.borderClass} p-8 text-center shadow-soft ${className}`}
    >
      <span
        className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl shadow-xs ${current.wrapperClass}`}
      >
        <IconComponent size={26} aria-hidden="true" />
      </span>
      <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      {message && (
        <p className="mt-2 max-w-md text-xs leading-relaxed text-ink/65 sm:text-sm">
          {message}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default StateMessage;
