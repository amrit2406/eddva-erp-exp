import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Field } from '../../../../components/premium/form/FormParts';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { btnPrimary, btnSecondary, inputClass } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import { createBookCopy, createBookVendor, updateBookCopy, updateBookVendor } from '../../api/library.api';
import { reserveBook } from '../../api/reservations.api';
import type { Book, BookCopy, BookVendor, CopyCondition, CopyStatus, Member } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { CONDITION, COPY_STATUS, SETTABLE_COPY_STATUSES } from '../../utils/labels';
import MemberPicker from '../members/MemberPicker';

const useRefreshLibrary = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['library'] });
};

function Chips<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium ring-1 transition ${value === o.value ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Add a physical copy, or edit one (null copy + open = add).
export function CopyDialog({ open, book, copy, copies, onClose }: { open: boolean; book: Book; copy: BookCopy | null; copies: BookCopy[]; onClose: () => void }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={copy ? `Edit copy ${copy.barcode}` : 'Add a copy'} size="md">
      {open && <CopyFormBody key={copy?.copy_id ?? 'new'} book={book} copy={copy} copies={copies} onClose={onClose} />}
    </Modal>
  );
}

function CopyFormBody({ book, copy, copies, onClose }: { book: Book; copy: BookCopy | null; copies: BookCopy[]; onClose: () => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const [barcode, setBarcode] = useState(copy?.barcode ?? '');
  const [shelf, setShelf] = useState(copy?.rack_location ?? copies[0]?.rack_location ?? '');
  const [condition, setCondition] = useState<CopyCondition>(copy?.condition ?? 'new');
  const [acquired, setAcquired] = useState(copy?.acquired_date?.slice(0, 10) ?? '');
  const [price, setPrice] = useState(copy?.price !== null && copy?.price !== undefined ? String(toNumber(copy.price)) : copies[0]?.price ? String(toNumber(copies[0].price)) : '');
  const [status, setStatus] = useState<CopyStatus>(copy?.status ?? 'available');
  const [showErrors, setShowErrors] = useState(false);

  const lent = copy?.status === 'issued';
  const clash = barcode.trim() && copies.find((c) => c.copy_id !== copy?.copy_id && c.barcode.toLowerCase() === barcode.trim().toLowerCase());
  const priceValue = price.trim() === '' ? undefined : Number(price);
  const errors = {
    barcode: !barcode.trim() ? 'Scan or type the barcode stuck on the book' : clash ? 'Another copy already has this barcode' : undefined,
    price: priceValue !== undefined && (!Number.isFinite(priceValue) || priceValue < 0) ? 'Enter 0 or more' : undefined,
  };

  const save = useMutation({
    mutationFn: () => {
      const data = {
        barcode: barcode.trim(),
        rack_location: shelf.trim() || undefined,
        condition,
        acquired_date: acquired ? new Date(acquired).toISOString() : undefined,
        price: priceValue,
      };
      return copy ? updateBookCopy(copy.copy_id, lent ? data : { ...data, status }) : createBookCopy(book.book_id, data);
    },
    onSuccess: () => {
      refresh();
      toast.success(copy ? 'Copy saved' : `Copy ${barcode.trim()} added — it's ready to lend`);
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, copy ? 'Could not save the copy' : 'Could not add the copy')),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (errors.barcode || errors.price) setShowErrors(true);
        else save.mutate();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Barcode" error={clash ? errors.barcode : showErrors ? errors.barcode : undefined}>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Scan the label" autoFocus autoComplete="off" className={inputClass} />
        </Field>
        <Field label="Shelf (optional)" hint="Where it's kept, e.g. A1.">
          <input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="e.g. Rack A1" className={inputClass} />
        </Field>
        <Field label="Bought on (optional)">
          <input type="date" value={acquired} onChange={(e) => setAcquired(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Price (₹, optional)" error={showErrors ? errors.price : undefined}>
          <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Condition</span>
        <Chips label="Condition" value={condition} onChange={setCondition} options={(Object.keys(CONDITION) as CopyCondition[]).map((c) => ({ value: c, label: CONDITION[c].label }))} />
      </div>
      {copy &&
        (lent ? (
          <NextStep>This copy is lent out. Its status changes back to “On the shelf” when it's taken back.</NextStep>
        ) : (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Where is it now?</span>
            <Chips label="Copy status" value={status} onChange={setStatus} options={SETTABLE_COPY_STATUSES.map((s) => ({ value: s, label: COPY_STATUS[s].label }))} />
          </div>
        ))}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} disabled={save.isPending} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={save.isPending} className={btnPrimary}>
          {save.isPending ? 'Saving…' : copy ? 'Save copy' : 'Add copy'}
        </button>
      </div>
    </form>
  );
}

// Where this title is bought from.
export function VendorDialog({ open, book, vendor, onClose }: { open: boolean; book: Book; vendor: BookVendor | null; onClose: () => void }) {
  return (
    <Modal isOpen={open} onClose={onClose} title={vendor ? 'Edit supplier' : 'Add a supplier'} size="md">
      {open && <VendorFormBody key={vendor?.book_vendor_id ?? 'new'} book={book} vendor={vendor} onClose={onClose} />}
    </Modal>
  );
}

function VendorFormBody({ book, vendor, onClose }: { book: Book; vendor: BookVendor | null; onClose: () => void }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const [name, setName] = useState(vendor?.vendor_name ?? vendor?.name ?? '');
  const [contact, setContact] = useState(vendor?.contact_person ?? '');
  const [phone, setPhone] = useState(vendor?.phone ?? '');
  const [email, setEmail] = useState(vendor?.email ?? '');
  const [address, setAddress] = useState(vendor?.address ?? '');
  const [price, setPrice] = useState(vendor?.last_purchase_price !== null && vendor?.last_purchase_price !== undefined ? String(toNumber(vendor.last_purchase_price)) : '');
  const [showErrors, setShowErrors] = useState(false);

  const priceValue = price.trim() === '' ? undefined : Number(price);
  const errors = {
    name: !name.trim() ? 'Enter the supplier name' : undefined,
    phone: phone.trim() && !/^[0-9+\-\s()]{7,15}$/.test(phone.trim()) ? 'Enter a valid phone number' : undefined,
    email: email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim()) ? 'Enter a valid email' : undefined,
    price: priceValue !== undefined && (!Number.isFinite(priceValue) || priceValue < 0) ? 'Enter 0 or more' : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  const save = useMutation({
    mutationFn: () => {
      const data = {
        vendor_name: name.trim(),
        name: name.trim(),
        contact_person: contact.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        last_purchase_price: priceValue,
      };
      return vendor ? updateBookVendor(vendor.book_vendor_id, data) : createBookVendor(book.book_id, data);
    },
    onSuccess: () => {
      refresh();
      toast.success(vendor ? 'Supplier saved' : `${name.trim()} added`);
      onClose();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the supplier')),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (Object.values(errors).some(Boolean)) setShowErrors(true);
        else save.mutate();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supplier name" error={show(errors.name)} className="sm:col-span-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Book House" autoFocus className={inputClass} />
        </Field>
        <Field label="Contact person (optional)">
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Last price paid (₹, optional)" error={show(errors.price)}>
          <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Phone (optional)" error={show(errors.phone)}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email (optional)" error={show(errors.email)}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Address (optional)" className="sm:col-span-2">
          <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} disabled={save.isPending} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={save.isPending} className={btnPrimary}>
          {save.isPending ? 'Saving…' : vendor ? 'Save supplier' : 'Add supplier'}
        </button>
      </div>
    </form>
  );
}

// Put a member on the waiting list for a title.
export function ReserveDialog({ book, onClose, initialMember = null }: { book: Pick<Book, 'book_id' | 'title'> | null; onClose: () => void; initialMember?: Member | null }) {
  const { toast } = useToast();
  const refresh = useRefreshLibrary();
  const [member, setMember] = useState<Member | null>(initialMember);

  const close = () => {
    setMember(initialMember);
    onClose();
  };

  const save = useMutation({
    mutationFn: () => reserveBook(book!.book_id, { member_id: member!.member_id }),
    onSuccess: () => {
      refresh();
      toast.success(`${member?.name} is on the waiting list for “${book?.title}”`);
      close();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not reserve the book')),
  });

  return (
    <Modal isOpen={book !== null} onClose={() => !save.isPending && close()} title="Reserve this book" size="sm">
      {book && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            When a copy of <span className="font-semibold text-slate-900">{book.title}</span> comes back, it's kept aside for this member for a few days.
          </p>
          <MemberPicker value={member} onChange={setMember} autoFocus />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={close} disabled={save.isPending} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" onClick={() => save.mutate()} disabled={!member || save.isPending} className={btnPrimary}>
              {save.isPending ? 'Reserving…' : 'Reserve'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
