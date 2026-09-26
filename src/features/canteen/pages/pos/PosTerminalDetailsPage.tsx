import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, Monitor, Pencil, PlayCircle, Timer } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getOrders, getPosTerminal, getShifts } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cashDifference, dateTime, duration, orderStatusInfo, shortRef } from '../../utils/labels';

const RECENT = 6;

export default function PosTerminalDetailsPage() {
  const { id = '' } = useParams();
  const { data: terminal, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'terminal', id], queryFn: () => getPosTerminal(id), enabled: Boolean(id) });
  const { data: shifts = [] } = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });
  const { data: orders = [] } = useQuery({ queryKey: ['canteen', 'orders'], queryFn: () => getOrders() });

  const back = (
    <Link to="/canteen/pos/terminals" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Counters
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !terminal) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load counter')} onRetry={() => refetch()} />
      </div>
    );
  }

  const here = shifts.filter((s) => s.terminalId === terminal.id).sort((a, b) => b.shiftStart.localeCompare(a.shiftStart));
  const open = here.find((s) => s.status === 'OPEN');
  const counterOrders = orders.filter((o) => o.terminalId === terminal.id).sort((a, b) => (b.orderDate ?? b.createdAt).localeCompare(a.orderDate ?? a.createdAt));

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Monitor}
        title={terminal.name}
        status={<StatusPill label={open ? 'Shift open' : 'Closed'} color={open ? '#15936a' : '#94a3b8'} />}
        meta={terminal.location}
        accent={open ? '#15936a' : undefined}
        actions={
          <>
            {open ? (
              <Link to={`/canteen/pos/shifts/${open.id}`} className={btnPrimary}>
                <Timer className="h-4 w-4" /> Go to open shift
              </Link>
            ) : (
              <Link to={`/canteen/pos/shifts/open?terminalId=${terminal.id}`} className={btnPrimary}>
                <PlayCircle className="h-4 w-4" /> Open a shift
              </Link>
            )}
            <Link to={`/canteen/pos/terminals/${terminal.id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      >
        <NextStep tone={open ? 'good' : 'info'}>
          {open
            ? `A shift has been running for ${duration(open.shiftStart)} (started ${dateTime(open.shiftStart)} with ${rupees(toNumber(open.openingCash))} in the till). Close it at the end of the day to count the cash.`
            : 'No one is working this counter right now. Open a shift before taking orders here.'}
        </NextStep>
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard title={`Shifts · ${here.length}`} icon={Timer}>
          {here.length === 0 ? (
            <p className="text-sm text-slate-500">No shifts yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {here.slice(0, RECENT).map((s) => {
                const diff = s.status === 'CLOSED' && s.variance !== null && s.variance !== undefined ? cashDifference(toNumber(s.variance)) : null;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <Link to={`/canteen/pos/shifts/${s.id}`} className="font-medium text-brand-navy hover:text-brand">
                      {dateTime(s.shiftStart)}
                    </Link>
                    <span className="hidden text-xs text-slate-400 sm:block">{duration(s.shiftStart, s.shiftEnd)}</span>
                    <span className="ml-auto">{diff ? <StatusPill label={diff.label} color={diff.color} /> : <StatusPill label="Open" color="#15936a" />}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {here.length > RECENT && (
            <Link to="/canteen/pos/shifts" className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-navy">
              See all shifts
            </Link>
          )}
        </InfoCard>

        <InfoCard title={`Orders · ${counterOrders.length}`} icon={ClipboardList} delay={60}>
          {counterOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders taken here yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {counterOrders.slice(0, RECENT).map((o) => {
                const s = orderStatusInfo(o.status);
                return (
                  <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <Link to={`/canteen/orders/${o.id}`} className="font-medium text-brand-navy hover:text-brand">
                      {o.orderNumber ?? shortRef(o.id)}
                    </Link>
                    <span className="hidden truncate text-slate-500 sm:block">{o.member?.name}</span>
                    <span className="ml-auto whitespace-nowrap text-xs text-slate-400">{shortDate(o.orderDate ?? o.createdAt)}</span>
                    <span className="whitespace-nowrap font-medium tabular-nums text-slate-900">{rupees(toNumber(o.totalAmount))}</span>
                    <StatusPill label={s.label} color={s.color} />
                  </li>
                );
              })}
            </ul>
          )}
        </InfoCard>
      </div>
    </div>
  );
}
