import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Field } from '../../../../components/premium/form/FormParts';
import { btnPrimary, btnSecondary, inputClass } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { payFine, waiveFine } from '../../api/library.api';
import { useLibrarianStore } from '../../stores/librarian.store';
import type { Fine, PaymentMode } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { FINE_REASON, PAYMENT_MODE, fineLeft, finePaid } from '../../utils/labels';

const useRefreshLibrary = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['library'] });
};

function FineSummary({ fine }: { fine: Fine }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {[
        ['Fine', rupees(toNumber(fine.amount)), 'text-slate-900'],
        ['Paid', rupees(finePaid(fine)), 'text-emerald-700'],
        ['Left', rupees(fineLeft(fine)), 'text-red-600'],
      ].map(([label, value, tone]) => (
        <div key={label} className="rounded-2xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`font-semibold tabular-nums ${tone}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// Collect all or part of a fine.
export function PayFineDialog({ fine, onClose }: { fine: Fine | null; onClose: () => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const { librarianId } = useLibrarianStore();
  const [amount, setAmount] = useState<string | null>(null);
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [reference, setReference] = useState('');

  const left = fine ? fineLeft(fine) : 0;
  const text = amount ?? (left > 0 ? String(left) : '');
  const value = Number(text);
  const error = !text.trim() || !(value > 0) ? 'Enter an amount above ₹0' : value > left + 0.001 ? `Only ${rupees(left)} is left to pay` : undefined;

  const close = () => {
    setAmount(null);
    setReference('');
    onClose();
  };

  const save = useMutation({
    mutationFn: (f: Fine) => payFine(f.fine_id, { amount_paid: value, payment_mode: mode, transaction_ref: reference.trim() || undefined, received_by: librarianId }),
    onSuccess: () => {
      refresh();
      toast.success(`${rupees(value)} collected`);
      close();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not record the payment')),
  });

  return (
    <Modal isOpen={fine !== null} onClose={() => !save.isPending && close()} title="Collect fine" size="sm">
      {fine && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!error) save.mutate(fine);
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-600">{FINE_REASON[fine.reason] ?? 'Fine'}</p>
          <FineSummary fine={fine} />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Paid by</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment mode">
              {(Object.keys(PAYMENT_MODE) as PaymentMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-2 py-2 text-sm font-medium ring-1 transition ${mode === m ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {PAYMENT_MODE[m]}
                </button>
              ))}
            </div>
          </div>
          <Field label="Amount (₹)" error={amount !== null ? error : undefined} hint="Part payments are fine.">
            <input type="number" min={0} step="0.01" value={text} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          </Field>
          {mode !== 'cash' && (
            <Field label="Reference (optional)" hint="UPI / card slip number.">
              <input value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" className={inputClass} />
            </Field>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending || Boolean(error)} className={btnPrimary}>
              {save.isPending ? 'Saving…' : `Collect ${value > 0 ? rupees(value) : ''}`}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// Let a member off a fine, with the reason written down.
export function WaiveFineDialog({ fine, onClose }: { fine: Fine | null; onClose: () => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);

  const close = () => {
    setReason('');
    setShowError(false);
    onClose();
  };

  const save = useMutation({
    mutationFn: (f: Fine) => waiveFine(f.fine_id, { reason: reason.trim() }),
    onSuccess: () => {
      refresh();
      toast.success('Fine waived');
      close();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not waive the fine')),
  });

  return (
    <Modal isOpen={fine !== null} onClose={() => !save.isPending && close()} title="Waive fine" size="sm">
      {fine && (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (reason.trim()) save.mutate(fine);
            else setShowError(true);
          }}
          className="space-y-4"
        >
          <FineSummary fine={fine} />
          <p className="text-sm text-slate-600">The remaining {rupees(fineLeft(fine))} will be cancelled. This can't be undone.</p>
          <Field label="Reason" error={showError && !reason.trim() ? 'Say why, e.g. medical leave' : undefined}>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Was on medical leave" autoFocus className={inputClass} />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending} className={btnPrimary}>
              {save.isPending ? 'Saving…' : 'Waive fine'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
