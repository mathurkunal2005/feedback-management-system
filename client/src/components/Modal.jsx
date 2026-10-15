import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, width = 'max-w-lg' }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className={`panel w-full ${width} p-6 shadow-hard-lg`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-full p-1.5 hover:bg-desk"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-md">
      <p className="text-[15px] leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
