import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Monitor, Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deletePosTerminal, getPosTerminals, getShifts } from '../../api/canteen.api';
import type { PosTerminal } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

const KEY = ['canteen', 'terminals'];

export default function PosTerminalsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PosTerminal | null>(null);
  const { data: terminals = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => getPosTerminals() });
  const { data: shifts = [] } = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });

  const remove = useMutation({
    mutationFn: (t: PosTerminal) => deletePosTerminal(t.id),
    onSuccess: (_, t) => {
      queryClient.setQueryData<PosTerminal[]>(KEY, (current) => current?.filter((x) => x.id !== t.id));
      toast.success(`“${t.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this counter')),
    onSettled: () => setPendingDelete(null),
  });

  const openAt = useMemo(() => new Set(shifts.filter((s) => s.status === 'OPEN').map((s) => s.terminalId)), [shifts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return terminals.filter((t) => !q || t.name.toLowerCase().includes(q) || (t.location ?? '').toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [terminals, search]);

  const newButton = (
    <Link to="/canteen/pos/terminals/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New counter
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load counters')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Monitor} title="Counters" description="Billing points (POS terminals) where staff take orders and payments." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : terminals.length === 0 ? (
        <EmptyState icon={Monitor} title="No counters yet" message="Add each billing counter. Staff open a shift on a counter before taking orders." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name or place"
            />
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} counter{filtered.length === 1 ? '' : 's'} · {openAt.size} open now
            </p>
          </div>
          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(t) => t.id}
              page={page}
              onPage={setPage}
              noun="counters"
              minWidth={640}
              columns={[
                {
                  header: 'Counter',
                  cell: (t) => (
                    <Link to={`/canteen/pos/terminals/${t.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {t.name}
                    </Link>
                  ),
                },
                { header: 'Place', cell: (t) => <span className="text-slate-600">{t.location || '—'}</span> },
                { header: 'Right now', cell: (t) => <StatusPill label={openAt.has(t.id) ? 'Shift open' : 'Closed'} color={openAt.has(t.id) ? '#15936a' : '#94a3b8'} /> },
                { header: 'Orders', align: 'right', cell: (t) => <span className="text-slate-700">{t._count?.orders ?? 0}</span> },
                { header: 'Shifts', align: 'right', cell: (t) => <span className="text-slate-700">{t._count?.shifts ?? 0}</span> },
              ]}
              actions={(t) => (
                <>
                  <IconAction icon={Eye} label="View counter" to={`/canteen/pos/terminals/${t.id}`} tone="brand" />
                  <IconAction icon={Pencil} label="Edit counter" to={`/canteen/pos/terminals/${t.id}/edit`} />
                  <IconAction
                    icon={Trash2}
                    label={openAt.has(t.id) ? 'Close the open shift before deleting' : 'Delete counter'}
                    tone="danger"
                    disabled={openAt.has(t.id)}
                    onClick={() => setPendingDelete(t)}
                  />
                </>
              )}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this counter?"
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed.${pendingDelete._count?.orders ? ` It has ${pendingDelete._count.orders} past orders, so the delete may be refused.` : ''}`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete counter'}
      />
    </div>
  );
}
