import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, PlayCircle, Timer } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import { SearchBox, Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnPrimary } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getPosTerminals, getShifts } from '../../api/canteen.api';
import type { Shift } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { cashDifference, dateTime, duration } from '../../utils/labels';

export default function ShiftsPage() {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState('all');
  const [page, setPage] = useState(1);
  const { data: shifts = [], isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });
  const { data: terminals = [] } = useQuery({ queryKey: ['canteen', 'terminals'], queryFn: () => getPosTerminals() });

  const counterName = (s: Shift) => s.terminal?.name ?? terminals.find((t) => t.id === s.terminalId)?.name ?? 'Counter';
  const openCount = shifts.filter((s) => s.status === 'OPEN').length;

  const q = search.trim().toLowerCase();
  const filtered = shifts
    .filter((s) => (show === 'open' ? s.status === 'OPEN' : show === 'closed' ? s.status === 'CLOSED' : true))
    .filter((s) => !q || counterName(s).toLowerCase().includes(q))
    // Open shifts first, then newest.
    .sort((a, b) => (a.status === b.status ? b.shiftStart.localeCompare(a.shiftStart) : a.status === 'OPEN' ? -1 : 1));

  const openButton = (
    <Link to="/canteen/pos/shifts/open" className={btnPrimary}>
      <PlayCircle className="h-4 w-4" /> Open a shift
    </Link>
  );

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load shifts')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader icon={Timer} title="Shifts" description="Each shift starts with the cash in the till and ends by counting it again." actions={openButton} />

      {isLoading ? (
        <ListSkeleton />
      ) : shifts.length === 0 ? (
        <EmptyState icon={Timer} title="No shifts yet" message="Open a shift on a counter at the start of the day, then close it when you finish to count the cash." action={openButton} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by counter"
            />
            <Segmented
              label="Shift status"
              value={show}
              onChange={(v) => {
                setShow(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All', count: shifts.length },
                { value: 'open', label: 'Open', count: openCount },
                { value: 'closed', label: 'Closed', count: shifts.length - openCount },
              ]}
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
              rowKey={(s) => s.id}
              page={page}
              onPage={setPage}
              noun="shifts"
              minWidth={780}
              columns={[
                {
                  header: 'Counter',
                  cell: (s) => (
                    <Link to={`/canteen/pos/shifts/${s.id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {counterName(s)}
                    </Link>
                  ),
                },
                {
                  header: 'Started',
                  cell: (s) => (
                    <div>
                      <span className="text-slate-700">{dateTime(s.shiftStart)}</span>
                      <span className="block text-[11px] text-slate-400">{s.status === 'OPEN' ? `Running ${duration(s.shiftStart)}` : `Lasted ${duration(s.shiftStart, s.shiftEnd)}`}</span>
                    </div>
                  ),
                },
                { header: 'Cash at start', align: 'right', cell: (s) => <span className="text-slate-700">{rupees(toNumber(s.openingCash))}</span> },
                {
                  header: 'Counted at close',
                  align: 'right',
                  cell: (s) => (s.status === 'CLOSED' ? <span className="text-slate-700">{rupees(toNumber(s.closingCash))}</span> : <span className="text-slate-400">—</span>),
                },
                {
                  header: 'Result',
                  cell: (s) => {
                    if (s.status === 'OPEN') return <StatusPill label="Open now" color="#15936a" />;
                    const diff = cashDifference(toNumber(s.variance));
                    return <StatusPill label={diff.label} color={diff.color} title="Cash counted compared with what the till should hold" />;
                  },
                },
              ]}
              actions={(s) => <IconAction icon={Eye} label={s.status === 'OPEN' ? 'View or close shift' : 'View shift'} to={`/canteen/pos/shifts/${s.id}`} tone="brand" />}
            />
          )}
        </>
      )}
    </div>
  );
}
