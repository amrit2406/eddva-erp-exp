import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookMarked, BookPlus, Plus, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { Field } from '../../../../components/premium/form/FormParts';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, inputClass, shortDate } from '../../../../components/premium/styles';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import { ReserveDialog } from '../../components/books/BookDialogs';
import { getBooks } from '../../api/library.api';
import { cancelReservation, getReservations } from '../../api/reservations.api';
import { useToday } from '../../hooks/useToday';
import type { Book, Reservation } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { canCancelReservation, daysBetween, reservationStatusInfo } from '../../utils/labels';

const FILTERS = [
  { value: 'open', label: 'Open', match: (s: string) => s === 'pending' || s === 'ready_for_pickup' },
  { value: 'ready_for_pickup', label: 'Ready to collect', match: (s: string) => s === 'ready_for_pickup' },
  { value: 'pending', label: 'Waiting', match: (s: string) => s === 'pending' },
  { value: 'closed', label: 'Done', match: (s: string) => s === 'fulfilled' || s === 'cancelled' || s === 'expired' },
  { value: 'all', label: 'All', match: () => true },
];

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = useToday();
  const [search, setSearch] = useState('');
  const [show, setShow] = useState('open');
  const [page, setPage] = useState(1);
  const [picking, setPicking] = useState(false);
  const [reserveBook, setReserveBook] = useState<Book | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Reservation | null>(null);
  const { data: reservations = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'reservations'], queryFn: () => getReservations() });

  const cancel = useMutation({
    mutationFn: (r: Reservation) => cancelReservation(r.reservation_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Reservation cancelled');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not cancel the reservation')),
    onSettled: () => setPendingCancel(null),
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    FILTERS.forEach((f) => (map[f.value] = reservations.filter((r) => f.match(r.status)).length));
    return map;
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filter = FILTERS.find((f) => f.value === show) ?? FILTERS[0];
    return reservations
      .filter((r) => filter.match(r.status))
      .filter((r) => !q || [r.book?.title, r.book?.author, r.member?.name, r.member?.library_card_number].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.reserved_date.localeCompare(b.reserved_date));
  }, [reservations, search, show]);

  const newButton = (
    <button type="button" onClick={() => setPicking(true)} className={btnPrimary}>
      <Plus className="h-4 w-4" /> New reservation
    </button>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load reservations')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={BookMarked} title="Reservations" description="Members waiting for a book that's out. When a copy comes back it's kept aside for the first in line." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : reservations.length === 0 ? (
        <EmptyState icon={BookMarked} title="No reservations" message="When every copy of a book is out, reserve it for a member and they'll be next in line." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by book or member"
            />
            <Segmented
              label="Reservation status"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={FILTERS.map((f) => ({ value: f.value, label: f.label, count: counts[f.value] }))}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setShow('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(r) => r.reservation_id}
              page={page}
              onPage={setPage}
              noun="reservations"
              minWidth={780}
              columns={[
                {
                  header: 'Book',
                  cell: (r) => (
                    <div>
                      <Link to={`/library/books/${r.book_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                        {r.book?.title ?? `Book #${r.book_id}`}
                      </Link>
                      <p className="text-xs text-slate-500">{r.book?.author}</p>
                    </div>
                  ),
                },
                {
                  header: 'Member',
                  cell: (r) => (
                    <div>
                      <Link to={`/library/members/${r.member_id}`} className="text-slate-800 hover:text-brand">
                        {r.member?.name ?? `Member #${r.member_id}`}
                      </Link>
                      <p className="font-mono text-[11px] text-slate-500">{r.member?.library_card_number}</p>
                    </div>
                  ),
                },
                { header: 'Reserved', cell: (r) => <span className="text-slate-600">{shortDate(r.reserved_date)}</span> },
                {
                  header: 'Keep until',
                  cell: (r) => {
                    if (!r.expiry_date || !canCancelReservation(r.status)) return <span className="text-slate-400">—</span>;
                    const left = daysBetween(today, r.expiry_date);
                    return (
                      <div>
                        <span className="text-slate-700">{shortDate(r.expiry_date)}</span>
                        <p className={`text-xs ${left < 0 ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{left < 0 ? 'Past — will expire' : left === 0 ? 'Last day' : `${left} day${left === 1 ? '' : 's'} left`}</p>
                      </div>
                    );
                  },
                },
                {
                  header: 'Status',
                  cell: (r) => {
                    const s = reservationStatusInfo(r.status);
                    return <StatusPill label={s.label} color={s.color} title={s.hint} />;
                  },
                },
              ]}
              actions={(r) => (
                <>
                  <IconAction
                    icon={BookPlus}
                    label={r.status === 'ready_for_pickup' ? 'Lend it now' : 'Can lend once a copy is ready'}
                    to={`/library/issues/desk?bookId=${r.book_id}&memberId=${r.member_id}`}
                    disabled={r.status !== 'ready_for_pickup'}
                    tone="brand"
                  />
                  <IconAction icon={X} label={canCancelReservation(r.status) ? 'Cancel reservation' : 'Already closed'} tone="danger" disabled={!canCancelReservation(r.status)} onClick={() => setPendingCancel(r)} />
                </>
              )}
            />
          )}
        </>
      )}

      <PickBookDialog
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(b) => {
          setPicking(false);
          setReserveBook(b);
        }}
      />
      <ReserveDialog book={reserveBook} onClose={() => setReserveBook(null)} />
      <ConfirmDialog
        isOpen={pendingCancel !== null}
        onClose={() => !cancel.isPending && setPendingCancel(null)}
        onConfirm={() => pendingCancel && cancel.mutate(pendingCancel)}
        title="Cancel this reservation?"
        message={pendingCancel ? `${pendingCancel.member?.name ?? 'The member'} will be taken off the waiting list for “${pendingCancel.book?.title ?? 'this book'}”.` : ''}
        confirmText={cancel.isPending ? 'Cancelling…' : 'Cancel reservation'}
      />
    </div>
  );
}

// First step of a new reservation: which book?
function PickBookDialog({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (book: Book) => void }) {
  const { data: books = [] } = useQuery({ queryKey: ['library', 'books'], queryFn: getBooks, enabled: open });
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = books.filter((b) => !q || [b.title, b.author, b.isbn].some((v) => v?.toLowerCase().includes(q))).slice(0, 8);

  return (
    <Modal isOpen={open} onClose={onClose} title="Which book?" size="sm">
      <div className="space-y-3">
        <Field label="Search the catalogue">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, author or ISBN" autoFocus className={inputClass} />
        </Field>
        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-2xl ring-1 ring-slate-200">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No book matches.</li>
          ) : (
            matches.map((b) => (
              <li key={b.book_id}>
                <button type="button" onClick={() => onPick(b)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{b.title}</span>
                    <span className="block text-xs text-slate-500">{b.author}</span>
                  </span>
                  <span className="ml-auto">
                    <StatusPill label={b._count?.copies ? `${b._count.copies} free` : 'All out'} color={b._count?.copies ? '#15936a' : '#c98500'} />
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </Modal>
  );
}
