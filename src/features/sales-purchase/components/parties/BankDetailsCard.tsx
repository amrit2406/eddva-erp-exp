import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Landmark, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import { Field, Toggle } from '../../../../components/premium/form/FormParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { btnPrimary, btnSecondary, cardClass, inputClass } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import type { VendorBankDetail, VendorBankDetailFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const empty: VendorBankDetailFormData = { account_no: '', ifsc: '', swift: '', bank_name: '', is_primary: false };

// Show only the last 4 digits of an account number.
const masked = (acc: string) => (acc.length > 4 ? `•••• ${acc.slice(-4)}` : acc);

interface BankDetailsCardProps {
  banks: VendorBankDetail[];
  onAdd: (values: VendorBankDetailFormData) => Promise<unknown>;
  onUpdate: (bankId: number, values: VendorBankDetailFormData) => Promise<unknown>;
  onDelete: (bankId: number) => Promise<unknown>;
  onChanged: () => void;
}

// Where to send payments to this vendor.
export default function BankDetailsCard({ banks, onAdd, onUpdate, onDelete, onChanged }: BankDetailsCardProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<VendorBankDetail | 'new' | null>(null);
  const [form, setForm] = useState<VendorBankDetailFormData>(empty);
  const [showErrors, setShowErrors] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<VendorBankDetail | null>(null);

  const open = (bank: VendorBankDetail | 'new') => {
    setEditing(bank);
    setForm(bank === 'new' ? { ...empty, is_primary: banks.length === 0 } : { account_no: bank.account_no, ifsc: bank.ifsc, swift: bank.swift ?? '', bank_name: bank.bank_name, is_primary: bank.is_primary });
    setShowErrors(false);
  };

  const save = useMutation({
    mutationFn: (values: VendorBankDetailFormData) => (editing && editing !== 'new' ? onUpdate(editing.bank_id, values) : onAdd(values)),
    onSuccess: () => {
      toast.success(editing === 'new' ? 'Bank account added' : 'Bank account saved');
      setEditing(null);
      onChanged();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the bank account')),
  });

  const remove = useMutation({
    mutationFn: (b: VendorBankDetail) => onDelete(b.bank_id),
    onSuccess: () => {
      toast.success('Bank account removed');
      onChanged();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the bank account')),
    onSettled: () => setPendingDelete(null),
  });

  const errors = {
    bank_name: form.bank_name.trim() ? undefined : 'Enter the bank name',
    account_no: /^\d{6,18}$/.test(form.account_no.trim()) ? undefined : 'Account numbers have 6 to 18 digits',
    ifsc: IFSC_PATTERN.test(form.ifsc.trim()) ? undefined : 'An IFSC has 11 characters, like SBIN0001234',
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    save.mutate({ ...form, bank_name: form.bank_name.trim(), account_no: form.account_no.trim(), ifsc: form.ifsc.trim(), swift: form.swift.trim() });
  };
  const show = (m?: string) => (showErrors ? m : undefined);

  return (
    <section className={`animate-rise ${cardClass}`} style={{ animationDelay: '60ms' }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Bank accounts · {banks.length}</h2>
        <button type="button" onClick={() => open('new')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10">
          <Plus className="h-4 w-4" /> Add account
        </button>
      </div>

      {banks.length === 0 ? (
        <p className="py-3 text-sm text-slate-500">No bank accounts yet. Add one so payments can be sent.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {banks.map((b) => (
            <li key={b.bank_id} className="flex items-start gap-3 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Landmark className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  {b.bank_name}
                  {b.is_primary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      <Star className="h-3 w-3" /> Primary
                    </span>
                  )}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {masked(b.account_no)} · {b.ifsc}
                  {b.swift && ` · ${b.swift}`}
                </p>
              </div>
              <div className="flex">
                <IconAction icon={Pencil} label="Edit account" onClick={() => open(b)} />
                <IconAction icon={Trash2} label="Remove account" tone="danger" onClick={() => setPendingDelete(b)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={editing !== null} onClose={() => !save.isPending && setEditing(null)} title={editing === 'new' ? 'Add bank account' : 'Edit bank account'} size="md">
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank name" className="sm:col-span-2" error={show(errors.bank_name)}>
              <input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. State Bank of India" autoFocus className={inputClass} />
            </Field>
            <Field label="Account number" error={show(errors.account_no)}>
              <input value={form.account_no} onChange={(e) => setForm({ ...form, account_no: e.target.value.replace(/\D/g, '') })} inputMode="numeric" placeholder="Digits only" className={`${inputClass} font-mono`} />
            </Field>
            <Field label="IFSC" error={show(errors.ifsc)}>
              <input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase().replace(/\s/g, '') })} maxLength={11} placeholder="SBIN0001234" className={`${inputClass} font-mono`} />
            </Field>
            <Field label="SWIFT (optional)" hint="Only for payments from abroad.">
              <input value={form.swift} onChange={(e) => setForm({ ...form, swift: e.target.value.toUpperCase() })} placeholder="SBININBB" className={`${inputClass} font-mono`} />
            </Field>
          </div>
          <Toggle label="Primary account" description="Used by default when paying this vendor." checked={form.is_primary} onChange={(is_primary) => setForm({ ...form, is_primary })} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending} className={btnPrimary}>
              {save.isPending ? 'Saving…' : editing === 'new' ? 'Add account' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Remove this bank account?"
        message={pendingDelete ? `${pendingDelete.bank_name} account ${masked(pendingDelete.account_no)} will be removed.` : ''}
        confirmText={remove.isPending ? 'Removing…' : 'Remove'}
      />
    </section>
  );
}
