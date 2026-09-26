import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { btnPrimary, btnSecondary, cardClass } from '../styles';

// Label + control + either an error or a hint underneath.
export function Field({ label, hint, error, className = '', children }: { label: string; hint?: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

// A white card with an optional heading and helper line.
export function FormCard({ title, description, action, children }: { title?: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={cardClass}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

// Cancel (goes back) + Save, bottom-right.
export function FormActions({ submitText, isSubmitting, onCancel }: { submitText: string; isSubmitting: boolean; onCancel?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onCancel ?? (() => navigate(-1))} disabled={isSubmitting} className={btnSecondary}>
        Cancel
      </button>
      <button type="submit" disabled={isSubmitting} className={btnPrimary}>
        {isSubmitting ? 'Saving…' : submitText}
      </button>
    </div>
  );
}

// On/off switch with a label and a one-line explanation.
export function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// Loading / failed states for a form while its dropdown data arrives.
export function FormLoading({ blocks = 2 }: { blocks?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading form">
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className={`skeleton rounded-3xl ${i === 0 ? 'h-40' : 'h-56'}`} />
      ))}
    </div>
  );
}
