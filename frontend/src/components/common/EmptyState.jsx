import React from 'react';
import { CalendarX, SearchX, Ticket } from 'lucide-react';

function EmptyState({
  title = 'No items found',
  message = 'Try changing your filters or searching for something else.',
  icon: Icon = CalendarX,
  action = null,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-ink/10 bg-white/70 p-8 text-center backdrop-blur-sm sm:p-12 ${className}`}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-coral/10 text-coral shadow-inner">
        <Icon size={32} aria-hidden="true" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h3>
      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink/65 sm:text-base">{message}</p>
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
