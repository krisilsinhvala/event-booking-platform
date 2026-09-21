import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * A styled confirmation modal to replace native `window.confirm()`.
 * Renders a centered overlay with a message, confirm, and cancel buttons.
 *
 * @param {{ open: boolean, title: string, message: string, confirmLabel?: string, cancelLabel?: string, onConfirm: () => void, onCancel: () => void, isLoading?: boolean }} props
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Yes, proceed',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false
}) {
  const confirmRef = useRef(null);

  // Focus the cancel button when modal opens for accessibility
  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink/40 transition hover:bg-sand hover:text-ink"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle size={28} />
        </div>

        {/* Content */}
        <h3 className="mt-5 text-center font-display text-xl font-bold text-ink sm:text-2xl">
          {title}
        </h3>
        {message && (
          <p className="mt-2 text-center text-sm leading-relaxed text-ink/60">
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-sand disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-600 hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
