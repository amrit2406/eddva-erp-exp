import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Download } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnSecondary, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import type { RegisterSummary } from '../../types/sales-purchase.types';
import { paymentStatusInfo } from '../../utils/party';

// One register line, normalised for purchase and sales alike.
export interface RegisterRow {
  key: string;
  invoiceNumber: string;
  // Vendor's own invoice number (purchase only).
  theirNumber?: string;
  date: string;
  party: string;
  partyCode: string;
  item: string;
  itemCode: string;
  quantity: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  total: number;
  paymentStatus: string;
}

interface RegisterViewProps {
  icon: LucideIcon;
  title: string;
  description: string;
  partyLabel: 'Vendor' | 'Customer';
  rows: RegisterRow[];
  summary?: RegisterSummary;
  isLoading: boolean;
  error: unknown;
  errorMessage: string;
  onRetry: () => void;
  fileName: string;
}

const csvCell = (v: string | number) => {
  const text = String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function downloadCsv(rows: RegisterRow[], partyLabel: string, fileName: string) {
  const header = ['Date', 'Invoice', ...(partyLabel === 'Vendor' ? ['Vendor invoice no.'] : []), partyLabel, `${partyLabel} code`, 'Item', 'Item code', 'Qty', 'Taxable value', 'CGST', 'SGST', 'IGST', 'Discount', 'Line total', 'Payment'];
  const lines = rows.map((r) => [
    r.date.slice(0, 10),
    r.invoiceNumber,
    ...(partyLabel === 'Vendor' ? [r.theirNumber ?? ''] : []),
    r.party,
    r.partyCode,
    r.item,
    r.itemCode,
    r.quantity,
    r.taxable,
    r.cgst,
    r.sgst,
    r.igst,
    r.discount,
    r.total,
    paymentStatusInfo(r.paymentStatus).label,
  ]);
  const csv = [header, ...lines].map((l) => l.map(csvCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Read-only list of every posted invoice line, with totals and CSV export.
export default function RegisterView({ icon, title, description, partyLabel, rows, summary, isLoading, error, errorMessage, onRetry, fileName }: RegisterViewProps) {
  const [search, setSearch] = useState('');
  const [paid, setPaid] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => paid === 'all' || (paid === 'PAID' ? r.paymentStatus === 'PAID' : r.paymentStatus !== 'PAID'))
      .filter((r) => !q || [r.invoiceNumber, r.theirNumber, r.party, r.partyCode, r.item, r.itemCode].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.invoiceNumber.localeCompare(a.invoiceNumber));
  }, [rows, search, paid]);

  // Filtered totals when narrowed; the server's summary otherwise.
  const narrowed = search.trim() !== '' || paid !== 'all';
  const totals = narrowed
    ? {
        invoices: new Set(filtered.map((r) => r.invoiceNumber)).size,
        taxable: filtered.reduce((s, r) => s + r.taxable, 0),
        cgst: filtered.reduce((s, r) => s + r.cgst, 0),
        sgst: filtered.reduce((s, r) => s + r.sgst, 0),
        igst: filtered.reduce((s, r) => s + r.igst, 0),
        total: filtered.reduce((s, r) => s + r.total, 0),
      }
    : {
        invoices: summary?.invoiceCount ?? 0,
        taxable: toNumber(summary?.totalSubtotal),
        cgst: toNumber(summary?.totalCgst),
        sgst: toNumber(summary?.totalSgst),
        igst: toNumber(summary?.totalIgst),
        total: toNumber(summary?.totalGrandTotal),
      };

  if (error) return <ErrorState message={errorMessage} onRetry={onRetry} />;

  const exportButton = (
    <button type="button" onClick={() => downloadCsv(filtered, partyLabel, fileName)} disabled={filtered.length === 0} className={btnSecondary}>
      <Download className="h-4 w-4" /> Export CSV
    </button>
  );

  const tiles = [
    { label: 'Invoices', value: totals.invoices.toLocaleString('en-IN') },
    { label: 'Taxable value', value: rupees(totals.taxable) },
    { label: 'Tax', value: rupees(totals.cgst + totals.sgst + totals.igst), hint: `CGST ${rupees(totals.cgst)} · SGST ${rupees(totals.sgst)} · IGST ${rupees(totals.igst)}` },
    { label: 'Grand total', value: rupees(totals.total) },
  ];

  return (
    <div className="space-y-5">
      <ListHeader icon={icon} title={title} description={description} actions={!isLoading && rows.length > 0 ? exportButton : undefined}>
        {!isLoading && rows.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-xs text-slate-500">
                  {t.label}
                  {narrowed && ' (filtered)'}
                </p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight tabular-nums text-slate-900">{t.value}</p>
                {t.hint && <p className="truncate text-[11px] text-slate-400">{t.hint}</p>}
              </div>
            ))}
          </div>
        )}
      </ListHeader>

      {isLoading ? (
        <ListSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState icon={icon} title="Nothing to show yet" message="Lines appear here once invoices are posted." />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder={`Search by invoice, ${partyLabel.toLowerCase()} or item`}
            />
            <Segmented
              label="Filter by payment"
              value={paid}
              onChange={(v) => {
                setPaid(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'PAID', label: 'Paid' },
                { value: 'UNPAID', label: 'Not paid' },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <NoResults
              onClear={() => {
                setSearch('');
                setPaid('all');
              }}
            />
          ) : (
            <PagedTable
              rows={filtered}
              rowKey={(r) => r.key}
              page={page}
              onPage={setPage}
              noun="lines"
              minWidth={960}
              columns={[
                { header: 'Date', cell: (r) => <span className="whitespace-nowrap text-slate-600">{shortDate(r.date)}</span> },
                {
                  header: 'Invoice',
                  cell: (r) => (
                    <>
                      <p className="font-medium text-slate-900">{r.invoiceNumber}</p>
                      {r.theirNumber && <p className="text-[11px] text-slate-400">Their no. {r.theirNumber}</p>}
                    </>
                  ),
                },
                { header: partyLabel, cell: (r) => <span className="block max-w-[160px] truncate text-slate-700">{r.party}</span> },
                { header: 'Item', cell: (r) => <span className="block max-w-[160px] truncate text-slate-700">{r.item}</span> },
                { header: 'Qty', align: 'right', cell: (r) => r.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 }) },
                { header: 'Taxable', align: 'right', cell: (r) => rupees(r.taxable) },
                {
                  header: 'Tax',
                  align: 'right',
                  cell: (r) => (
                    <>
                      <p>{rupees(r.cgst + r.sgst + r.igst)}</p>
                      <p className="text-[11px] text-slate-400">{r.igst > 0 ? `IGST ${rupees(r.igst)}` : `C ${rupees(r.cgst)} · S ${rupees(r.sgst)}`}</p>
                    </>
                  ),
                },
                { header: 'Total', align: 'right', cell: (r) => <span className="font-semibold text-slate-900">{rupees(r.total)}</span> },
                {
                  header: 'Payment',
                  cell: (r) => {
                    const s = paymentStatusInfo(r.paymentStatus);
                    return <StatusPill label={s.label} color={s.color} />;
                  },
                },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
}
