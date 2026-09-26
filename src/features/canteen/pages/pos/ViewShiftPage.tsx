import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Banknote, ClipboardList, Timer } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { Field } from '../../../../components/premium/form/FormParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, inputClass } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { closeShift, getOrders, getShift } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cashDifference, dateTime, duration, orderStatusInfo, shortRef } from '../../utils/labels';

export default function ViewShiftPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cash, setCash] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const { data: shift, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'shift', id], queryFn: () => getShift(id), enabled: Boolean(id) });
  const { data: orders = [] } = useQuery({ queryKey: ['canteen', 'orders'], queryFn: () => getOrders() });

  const close = useMutation({
    mutationFn: (closingCash: number) => closeShift(id, { closingCash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'shift', id] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'shifts'] });
      toast.success('Shift closed');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not close the shift')),
  });

  const back = (
    <Link to="/canteen/pos/shifts" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Shifts
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !shift) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load shift')} onRetry={() => refetch()} />
      </div>
    );
  }

  const isOpen = shift.status === 'OPEN';
  const counter = shift.terminal?.name ?? 'Counter';
  const cashValue = cash.trim() === '' ? NaN : Number(cash);
  const cashError = !Number.isFinite(cashValue) || cashValue < 0 ? 'Enter the cash you counted' : undefined;
  const diff = !isOpen ? cashDifference(toNumber(shift.variance)) : null;
  // Orders taken on this counter while the shift was running.
  const start = new Date(shift.shiftStart).getTime();
  // An open shift has no end yet, so everything since the start counts.
  const end = shift.shiftEnd ? new Date(shift.shiftEnd).getTime() : Number.POSITIVE_INFINITY;
  const during = orders.filter((o) => {
    const at = new Date(o.orderDate ?? o.createdAt).getTime();
    return o.terminalId === shift.terminalId && at >= start && at <= end;
  });
  const takings = during.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + toNumber(o.totalAmount), 0);

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashError) {
      setShowErrors(true);
      return;
    }
    close.mutate(cashValue);
  };

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Timer}
        title={`${counter} shift`}
        status={<StatusPill label={isOpen ? 'Open' : 'Closed'} color={isOpen ? '#15936a' : '#94a3b8'} />}
        meta={isOpen ? `Started ${dateTime(shift.shiftStart)} · running ${duration(shift.shiftStart)}` : `${dateTime(shift.shiftStart)} – ${dateTime(shift.shiftEnd)} · ${duration(shift.shiftStart, shift.shiftEnd)}`}
        accent={isOpen ? '#15936a' : diff?.color}
      >
        {isOpen ? (
          <NextStep>At the end of the shift, count the cash in the till and close the shift below. The difference from what's expected is worked out for you.</NextStep>
        ) : (
          <NextStep tone={diff?.label === 'Matched' ? 'good' : 'bad'}>
            {diff?.label === 'Matched'
              ? 'The cash counted matched what the till should hold.'
              : `The till had ${diff?.label} compared with what it should hold (${rupees(toNumber(shift.expectedCash))}).`}
          </NextStep>
        )}
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <InfoCard
            title="Cash"
            icon={Banknote}
            rows={[
              ['At the start', rupees(toNumber(shift.openingCash))],
              ...(!isOpen
                ? ([
                    ['Should be in the till', rupees(toNumber(shift.expectedCash))],
                    ['Counted at close', rupees(toNumber(shift.closingCash))],
                    ['Difference', <StatusPill label={diff!.label} color={diff!.color} />],
                  ] as [string, React.ReactNode][])
                : []),
            ]}
          />

          {isOpen && (
            <form onSubmit={handleClose} noValidate className="animate-rise rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6">
              <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-slate-900">Close this shift</h2>
              <Field label="Cash counted in the till (₹)" error={showErrors ? cashError : undefined}>
                <input type="number" min={0} step="0.01" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="e.g. 1250" className={inputClass} />
              </Field>
              <button type="submit" disabled={close.isPending} className={`${btnPrimary} mt-4 w-full`}>
                {close.isPending ? 'Closing…' : 'Close shift'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          <InfoCard title={`Orders in this shift · ${during.length}`} icon={ClipboardList} delay={60} action={during.length > 0 && <span className="text-sm font-medium text-slate-700">{rupees(takings)}</span>}>
            {during.length === 0 ? (
              <p className="text-sm text-slate-500">No orders taken on this counter during the shift.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {during.map((o) => {
                  const s = orderStatusInfo(o.status);
                  return (
                    <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <Link to={`/canteen/orders/${o.id}`} className="font-medium text-brand-navy hover:text-brand">
                        {o.orderNumber ?? shortRef(o.id)}
                      </Link>
                      <span className="hidden truncate text-slate-500 sm:block">{o.member?.name}</span>
                      <span className="ml-auto whitespace-nowrap font-medium tabular-nums text-slate-900">{rupees(toNumber(o.totalAmount))}</span>
                      <StatusPill label={s.label} color={s.color} />
                    </li>
                  );
                })}
              </ul>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
