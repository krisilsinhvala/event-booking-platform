import React from 'react';

function PageHeader({
  badge = null,
  title,
  subtitle = null,
  actions = null,
  className = ''
}) {
  return (
    <div className={`flex flex-col justify-between gap-4 pb-8 sm:flex-row sm:items-end ${className}`}>
      <div className="max-w-2xl">
        {badge && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral">
            {badge}
          </p>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-base leading-relaxed text-ink/65">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
