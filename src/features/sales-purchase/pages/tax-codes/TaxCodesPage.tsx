import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Percent, Plus, Power, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary, shortDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { deleteTaxCode, getItems, getTaxCodes, setTaxCodeActive } from '../../api/sales-purchase.api';
import type { TaxCode } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { formatRate, TAX_KIND_LABEL, taxBreakdown, taxKind, totalRate } from '../../utils/taxCode';

const KEY = ['sales-purchase', 'tax-codes'];

export default function TaxCodesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<TaxCode | null>(null);

  const { data: codes = [], isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: getTaxCodes });
  const { data: items = [] } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const usage = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((i) => map.set(i.tax_code_id, (map.get(i.tax_code_id) ?? 0) + 1));
    return map;
  }, [items]);

  const toggle = useMutation({
    mutationFn: (t: TaxCode) => setTaxCodeActive(t.tax_code_id, !t.is_active),
    onSuccess: (updated, t) => {
      queryClient.setQueryData<TaxCode[]>(KEY, (current) => current?.map((x) => (x.tax_code_id === t.tax_code_id ? { ...x, is_active: updated?.is_active ?? !t.is_active } : x)));
      toast.success(`${t.name} turned ${t.is_active ? 'off' : 'on'}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change this tax code')),
  });

  const remove = useMutation({
    mutationFn: (t: TaxCode) => deleteTaxCode(t.tax_code_id),
    onSuccess: (_, t) => {
      queryClient.setQueryData<TaxCode[]>(KEY, (current) => current?.filter((x) => x.tax_code_id !== t.tax_code_id));
      toast.success(`${t.name} deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this tax code')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return codes
      .filter((t) => (status === 'all' ? true : status === 'on' ? t.is_active : !t.is_active))
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .sort((a, b) => totalRate(a) - totalRate(b) || a.name.localeCompare(b.name));
  }, [codes, search, status]);

  const newButton = (
    <Link to="/sales-purchase/tax-codes/new" className={btnPrimary}>
      <Plus className="h-4 w-4" /> New tax code
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load tax codes')} onRetry={() => refetch()} />;
  const used = pendingDelete ? (usage.get(pendingDelete.tax_code_id) ?? 0) : 0;

  return (
    <div className="space-y-5">
      <ListHeader icon={Percent} title="Tax codes" description="GST rates you can apply to items, orders and invoices." actions={newButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : codes.length === 0 ? (
        <EmptyState icon={Percent} title="No tax codes yet" message="Add the GST rates you use — for example GST 5%, 12%, 18% and 28%." action={newButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search tax codes"
            />
            <Segmented
              label="Filter by status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: codes.length },
                { value: 'on', label: 'In use', count: codes.filter((t) => t.is_active).length },
                { value: 'off', label: 'Turned off', count: codes.filter((t) => !t.is_active).length },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setStatus('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(t) => t.tax_code_id}
              page={page}
              onPage={setPage}
              noun="tax codes"
              minWidth={760}
              columns={[
                {
                  header: 'Tax code',
                  cell: (t) => (
                    <Link to={`/sales-purchase/tax-codes/${t.tax_code_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {t.name}
                    </Link>
                  ),
                },
                {
                  header: 'Rate',
                  cell: (t) => (
                    <>
                      <p className="font-semibold text-slate-900 tabular-nums">{formatRate(totalRate(t))}</p>
                      <p className="text-xs text-slate-500">{taxBreakdown(t)}</p>
                    </>
                  ),
                },
                { header: 'Type', cell: (t) => <StatusPill {...TAX_KIND_LABEL[taxKind(t)]} /> },
                { header: 'Used by', cell: (t) => `${usage.get(t.tax_code_id) ?? 0} item${(usage.get(t.tax_code_id) ?? 0) === 1 ? '' : 's'}` },
                { header: 'Starts', cell: (t) => <span className="whitespace-nowrap text-slate-600">{shortDate(t.effective_from)}</span> },
                { header: 'Status', cell: (t) => <StatusPill label={t.is_active ? 'In use' : 'Turned off'} color={t.is_active ? '#15936a' : '#94a3b8'} /> },
              ]}
              actions={(t) => (
                <>
                  <IconAction icon={Eye} label="View tax code" to={`/sales-purchase/tax-codes/${t.tax_code_id}`} tone="brand" />
                  <IconAction icon={Power} label={t.is_active ? 'Turn off' : 'Turn on'} onClick={() => toggle.mutate(t)} disabled={toggle.isPending} />
                  <IconAction icon={Trash2} label="Delete tax code" tone="danger" onClick={() => setPendingDelete(t)} />
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
        title="Delete this tax code?"
        message={
          pendingDelete
            ? used > 0
              ? `${used} item${used === 1 ? ' uses' : 's use'} “${pendingDelete.name}”, and past invoices may too. Turning it off is safer than deleting it.`
              : `“${pendingDelete.name}” will be removed. If past invoices used it, turning it off is safer.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete tax code'}
      />
    </div>
  );
}
