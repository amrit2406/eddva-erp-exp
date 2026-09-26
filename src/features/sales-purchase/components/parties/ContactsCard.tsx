import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Mail, Pencil, Phone, Plus, Trash2, UserRound } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import { Field } from '../../../../components/premium/form/FormParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { btnPrimary, btnSecondary, cardClass, inputClass } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { EMAIL_PATTERN, PHONE_PATTERN } from '../../utils/party';

export interface ContactValues {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

interface Contact extends ContactValues {
  contact_id: number;
}

interface ContactsCardProps {
  contacts: Contact[];
  onAdd: (values: ContactValues) => Promise<unknown>;
  onUpdate: (contactId: number, values: ContactValues) => Promise<unknown>;
  onDelete: (contactId: number) => Promise<unknown>;
  // Called after any change so the page can reload.
  onChanged: () => void;
}

const empty: ContactValues = { name: '', designation: '', phone: '', email: '' };

// People to talk to at this vendor/customer, with an add/edit dialog.
export default function ContactsCard({ contacts, onAdd, onUpdate, onDelete, onChanged }: ContactsCardProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Contact | 'new' | null>(null);
  const [form, setForm] = useState<ContactValues>(empty);
  const [showErrors, setShowErrors] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);

  const open = (contact: Contact | 'new') => {
    setEditing(contact);
    setForm(contact === 'new' ? empty : { name: contact.name, designation: contact.designation ?? '', phone: contact.phone ?? '', email: contact.email ?? '' });
    setShowErrors(false);
  };

  const save = useMutation({
    mutationFn: (values: ContactValues) => (editing && editing !== 'new' ? onUpdate(editing.contact_id, values) : onAdd(values)),
    onSuccess: (_, values) => {
      toast.success(editing === 'new' ? `${values.name} added as a contact` : `${values.name} saved`);
      setEditing(null);
      onChanged();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the contact')),
  });

  const remove = useMutation({
    mutationFn: (c: Contact) => onDelete(c.contact_id),
    onSuccess: (_, c) => {
      toast.success(`${c.name} removed`);
      onChanged();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the contact')),
    onSettled: () => setPendingDelete(null),
  });

  const errors = {
    name: form.name.trim() ? undefined : 'Enter their name',
    phone: form.phone && !PHONE_PATTERN.test(form.phone.trim()) ? 'Enter a valid phone number' : undefined,
    email: form.email && !EMAIL_PATTERN.test(form.email.trim()) ? 'Enter a valid email address' : undefined,
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    save.mutate({ name: form.name.trim(), designation: form.designation.trim(), phone: form.phone.trim(), email: form.email.trim() });
  };
  const show = (m?: string) => (showErrors ? m : undefined);

  return (
    <section className={`animate-rise ${cardClass}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">Contacts · {contacts.length}</h2>
        <button type="button" onClick={() => open('new')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10">
          <Plus className="h-4 w-4" /> Add contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <p className="py-3 text-sm text-slate-500">No contacts yet. Add the person you usually speak to.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {contacts.map((c) => (
            <li key={c.contact_id} className="flex items-start gap-3 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <UserRound className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {c.name} {c.designation && <span className="font-normal text-slate-500">· {c.designation}</span>}
                </p>
                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 hover:text-brand">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-brand">
                      <Mail className="h-3 w-3" /> {c.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex">
                <IconAction icon={Pencil} label="Edit contact" onClick={() => open(c)} />
                <IconAction icon={Trash2} label="Remove contact" tone="danger" onClick={() => setPendingDelete(c)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={editing !== null} onClose={() => !save.isPending && setEditing(null)} title={editing === 'new' ? 'Add contact' : 'Edit contact'} size="md">
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={show(errors.name)}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" autoFocus className={inputClass} />
            </Field>
            <Field label="Role (optional)">
              <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Sales manager" className={inputClass} />
            </Field>
            <Field label="Phone" error={show(errors.phone)}>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" className={inputClass} />
            </Field>
            <Field label="Email" error={show(errors.email)}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" className={inputClass} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending} className={btnPrimary}>
              {save.isPending ? 'Saving…' : editing === 'new' ? 'Add contact' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Remove this contact?"
        message={pendingDelete ? `${pendingDelete.name} will be removed from this list.` : ''}
        confirmText={remove.isPending ? 'Removing…' : 'Remove'}
      />
    </section>
  );
}
