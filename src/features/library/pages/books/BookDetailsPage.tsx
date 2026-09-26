import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookMarked, BookOpen, BookPlus, Building2, Copy, Pencil, Plus, Trash2, UsersRound, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import BookCover from '../../components/books/BookCover';
import { CopyDialog, ReserveDialog, VendorDialog } from '../../components/books/BookDialogs';
import { RenewDialog, ReturnDialog } from '../../components/loans/LoanDialogs';
import LoanList from '../../components/loans/LoanList';
import { getIssues } from '../../api/issues.api';
import { deleteBookVendor, getBook, getBookCopies, getBookVendors } from '../../api/library.api';
import { cancelReservation, getReservations } from '../../api/reservations.api';
import type { BookCopy, BookIssue, BookVendor, Reservation } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { canCancelReservation, conditionInfo, copyStatusInfo, isOut, reservationStatusInfo } from '../../utils/labels';

export default function BookDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copyDialog, setCopyDialog] = useState<{ copy: BookCopy | null } | null>(null);
  const [vendorDialog, setVendorDialog] = useState<{ vendor: BookVendor | null } | null>(null);
  const [reserving, setReserving] = useState(false);
  const [returning, setReturning] = useState<BookIssue | null>(null);
  const [renewing, setRenewing] = useState<BookIssue | null>(null);
  const [confirm, setConfirm] = useState<{ vendor?: BookVendor; reservation?: Reservation } | null>(null);

  const { data: book, isLoading, error, refetch } = useQuery({ queryKey: ['library', 'book', id], queryFn: () => getBook(id), enabled: Boolean(id) });
  const { data: copies = [] } = useQuery({ queryKey: ['library', 'copies', id], queryFn: () => getBookCopies(id), enabled: Boolean(id) });
  const { data: vendors = [] } = useQuery({ queryKey: ['library', 'vendors', id], queryFn: () => getBookVendors(id), enabled: Boolean(id) });
  const { data: issues = [] } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });
  const { data: reservations = [] } = useQuery({ queryKey: ['library', 'reservations'], queryFn: () => getReservations() });

  const removeVendor = useMutation({
    mutationFn: (v: BookVendor) => deleteBookVendor(v.book_vendor_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'vendors', id] });
      toast.success('Supplier removed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove the supplier')),
    onSettled: () => setConfirm(null),
  });
  const cancel = useMutation({
    mutationFn: (r: Reservation) => cancelReservation(r.reservation_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Reservation cancelled');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not cancel the reservation')),
    onSettled: () => setConfirm(null),
  });

  const back = (
    <Link to="/library/books" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Books
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !book) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load book')} onRetry={() => refetch()} />
      </div>
    );
  }

  const copyIds = new Set(copies.map((c) => c.copy_id));
  const out = issues.filter((i) => isOut(i) && (copyIds.has(i.copy_id) || i.copy?.book_id === book.book_id));
  const free = copies.filter((c) => c.status === 'available').length;
  const waiting = reservations
    .filter((r) => r.book_id === book.book_id && canCancelReservation(r.status))
    .sort((a, b) => a.reserved_date.localeCompare(b.reserved_date));
  const loanOf = (c: BookCopy) => out.find((i) => i.copy_id === c.copy_id);

  const summary =
    copies.length === 0
      ? 'No copies yet. Add each physical copy with its barcode so it can be lent.'
      : free > 0
        ? `${free} of ${copies.length} cop${copies.length === 1 ? 'y is' : 'ies are'} on the shelf and can be lent now.`
        : `All ${copies.length} cop${copies.length === 1 ? 'y is' : 'ies are'} out. You can reserve it for a member — they'll get the next one back.`;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={BookOpen}
        title={book.title}
        status={book.category && <StatusPill label={book.category.name} color="#0a4a9c" />}
        meta={`by ${book.author}`}
        actions={
          <>
            {free > 0 ? (
              <Link to={`/library/issues/desk?bookId=${book.book_id}`} className={btnPrimary}>
                <BookPlus className="h-4 w-4" /> Lend a copy
              </Link>
            ) : (
              copies.length > 0 && (
                <button type="button" onClick={() => setReserving(true)} className={btnPrimary}>
                  <BookMarked className="h-4 w-4" /> Reserve
                </button>
              )
            )}
            {free > 0 && (
              <button type="button" onClick={() => setReserving(true)} className={btnSecondary}>
                <BookMarked className="h-4 w-4" /> Reserve
              </button>
            )}
            <Link to={`/library/books/${book.book_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row">
          <BookCover src={book.cover_image_url} title={book.title} size="lg" />
          <div className="flex-1 space-y-3">
            {book.description && <p className="text-sm text-slate-600">{book.description}</p>}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {[
                ['Publisher', book.publisher],
                ['Edition', book.edition],
                ['Year', book.publish_year],
                ['Language', book.language],
                ['ISBN', book.isbn],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
            </dl>
            <NextStep tone={copies.length === 0 ? 'bad' : free > 0 ? 'good' : 'info'}>{summary}</NextStep>
          </div>
        </div>
      </DetailHeader>

      <InfoCard
        title={`Copies · ${copies.length}`}
        icon={Copy}
        action={
          <button type="button" onClick={() => setCopyDialog({ copy: null })} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-navy">
            <Plus className="h-4 w-4" /> Add copy
          </button>
        }
      >
        {copies.length === 0 ? (
          <p className="text-sm text-slate-500">No copies yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Barcode</th>
                  <th className="px-3 py-2">Shelf</th>
                  <th className="px-3 py-2">Condition</th>
                  <th className="px-3 py-2">Where it is</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="py-2 pl-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {copies.map((c) => {
                  const s = copyStatusInfo(c.status);
                  const cond = conditionInfo(c.condition);
                  const loan = loanOf(c);
                  return (
                    <tr key={c.copy_id}>
                      <td className="py-2.5 pr-3">
                        <span className="font-mono font-medium text-slate-900">{c.barcode}</span>
                        {c.accession_number && <span className="block text-[11px] text-slate-400">{c.accession_number}</span>}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{c.rack_location || '—'}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <span className="h-2 w-2 rounded-full" style={{ background: cond.color }} />
                          {cond.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill label={s.label} color={s.color} />
                        {loan && (
                          <Link to={`/library/members/${loan.member_id}`} className="ml-2 text-xs text-slate-500 hover:text-brand">
                            with {loan.member?.name}
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{c.price !== null && c.price !== undefined ? rupees(toNumber(c.price)) : '—'}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <IconAction icon={Pencil} label="Edit copy" onClick={() => setCopyDialog({ copy: c })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </InfoCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard title={`Who has it · ${out.length}`} icon={UsersRound} delay={60}>
          <LoanList issues={out} show="member" onReturn={setReturning} onRenew={setRenewing} empty="Nobody has this book right now." />
        </InfoCard>

        <InfoCard title={`Waiting list · ${waiting.length}`} icon={BookMarked} delay={90}>
          {waiting.length === 0 ? (
            <p className="text-sm text-slate-500">Nobody is waiting for this book.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {waiting.map((r, index) => {
                const s = reservationStatusInfo(r.status);
                return (
                  <li key={r.reservation_id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span>
                    <div className="min-w-0">
                      <Link to={`/library/members/${r.member_id}`} className="font-medium text-brand-navy hover:text-brand">
                        {r.member?.name ?? `Member #${r.member_id}`}
                      </Link>
                      <p className="text-xs text-slate-500">Since {shortDate(r.reserved_date)}</p>
                    </div>
                    <span className="ml-auto">
                      <StatusPill label={s.label} color={s.color} title={s.hint} />
                    </span>
                    <IconAction icon={X} label="Cancel reservation" tone="danger" onClick={() => setConfirm({ reservation: r })} />
                  </li>
                );
              })}
            </ol>
          )}
        </InfoCard>
      </div>

      <InfoCard
        title={`Suppliers · ${vendors.length}`}
        icon={Building2}
        delay={120}
        action={
          <button type="button" onClick={() => setVendorDialog({ vendor: null })} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-navy">
            <Plus className="h-4 w-4" /> Add supplier
          </button>
        }
      >
        {vendors.length === 0 ? (
          <p className="text-sm text-slate-500">Where this book is bought from — handy when you need more copies.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {vendors.map((v) => (
              <li key={v.book_vendor_id} className="flex items-center gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{v.vendor_name || v.name}</p>
                  <p className="truncate text-xs text-slate-500">{[v.contact_person, v.phone, v.email].filter(Boolean).join(' · ') || 'No contact details'}</p>
                </div>
                {v.last_purchase_price !== null && v.last_purchase_price !== undefined && (
                  <span className="ml-auto whitespace-nowrap text-xs text-slate-500">
                    Last paid <span className="font-semibold text-slate-800">{rupees(toNumber(v.last_purchase_price))}</span>
                  </span>
                )}
                <span className={`flex ${v.last_purchase_price === null || v.last_purchase_price === undefined ? 'ml-auto' : ''}`}>
                  <IconAction icon={Pencil} label="Edit supplier" onClick={() => setVendorDialog({ vendor: v })} />
                  <IconAction icon={Trash2} label="Remove supplier" tone="danger" onClick={() => setConfirm({ vendor: v })} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </InfoCard>

      <CopyDialog open={copyDialog !== null} book={book} copy={copyDialog?.copy ?? null} copies={copies} onClose={() => setCopyDialog(null)} />
      <VendorDialog open={vendorDialog !== null} book={book} vendor={vendorDialog?.vendor ?? null} onClose={() => setVendorDialog(null)} />
      <ReserveDialog book={reserving ? book : null} onClose={() => setReserving(false)} />
      <ReturnDialog issue={returning} onClose={() => setReturning(null)} />
      <RenewDialog issue={renewing} onClose={() => setRenewing(null)} />
      <ConfirmDialog
        isOpen={confirm !== null}
        onClose={() => !(removeVendor.isPending || cancel.isPending) && setConfirm(null)}
        onConfirm={() => (confirm?.vendor ? removeVendor.mutate(confirm.vendor) : confirm?.reservation && cancel.mutate(confirm.reservation))}
        title={confirm?.vendor ? 'Remove this supplier?' : 'Cancel this reservation?'}
        message={
          confirm?.vendor
            ? `${confirm.vendor.vendor_name || confirm.vendor.name} will be removed from this book's suppliers.`
            : confirm?.reservation
              ? `${confirm.reservation.member?.name ?? 'The member'} will be taken off the waiting list for “${book.title}”.`
              : ''
        }
        confirmText={confirm?.vendor ? (removeVendor.isPending ? 'Removing…' : 'Remove') : cancel.isPending ? 'Cancelling…' : 'Cancel reservation'}
      />
    </div>
  );
}
