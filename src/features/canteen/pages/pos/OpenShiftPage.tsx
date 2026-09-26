import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { inputClass } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { getPosTerminals, getShifts, openShift } from '../../api/canteen.api';
import type { OpenShiftFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

const QUICK_CASH = [0, 500, 1000, 2000];

export default function OpenShiftPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const terminalsQuery = useQuery({ queryKey: ['canteen', 'terminals'], queryFn: () => getPosTerminals() });
  const { data: shifts = [] } = useQuery({ queryKey: ['canteen', 'shifts'], queryFn: () => getShifts() });
  const terminals = terminalsQuery.data ?? [];
  const busy = new Set(shifts.filter((s) => s.status === 'OPEN').map((s) => s.terminalId));

  const [terminalId, setTerminalId] = useState(searchParams.get('terminalId') ?? '');
  const [cash, setCash] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const cashValue = cash.trim() === '' ? NaN : Number(cash);
  const errors = {
    terminalId: !terminalId ? 'Choose a counter' : busy.has(terminalId) ? 'This counter already has an open shift' : undefined,
    cash: !Number.isFinite(cashValue) || cashValue < 0 ? 'Enter the cash in the till (0 if empty)' : undefined,
  };

  const open = useMutation({
    mutationFn: (data: OpenShiftFormData) => openShift(data),
    onSuccess: (shift) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'shifts'] });
      toast.success('Shift opened');
      navigate(shift?.id ? `/canteen/pos/shifts/${shift.id}` : '/canteen/pos/shifts');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not open the shift')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.terminalId || errors.cash) {
      setShowErrors(true);
      return;
    }
    open.mutate({ terminalId, openingCash: cashValue });
  };

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/pos/shifts', label: 'Shifts' }} title="Open a shift" subtitle="Count the cash in the till before you start taking orders." />
      {terminalsQuery.isLoading ? (
        <FormLoading blocks={1} />
      ) : terminalsQuery.error ? (
        <ErrorState message={getApiErrorMessage(terminalsQuery.error, 'Failed to load counters')} onRetry={() => terminalsQuery.refetch()} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormCard>
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <Field label="Counter" error={busy.has(terminalId) || showErrors ? errors.terminalId : undefined}>
                <select value={terminalId} onChange={(e) => setTerminalId(e.target.value)} className={inputClass}>
                  <option value="">Choose a counter</option>
                  {terminals.map((t) => (
                    <option key={t.id} value={t.id} disabled={busy.has(t.id)}>
                      {t.name}
                      {t.location ? ` — ${t.location}` : ''}
                      {busy.has(t.id) ? ' (already open)' : ''}
                    </option>
                  ))}
                </select>
                {terminals.length === 0 && (
                  <Link to="/canteen/pos/terminals/new" className="mt-1 inline-block text-xs font-medium text-brand hover:text-brand-navy">
                    Add a counter first
                  </Link>
                )}
              </Field>
              <Field label="Cash in the till (₹)" error={showErrors ? errors.cash : undefined}>
                <input type="number" min={0} step="0.01" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="e.g. 500" className={inputClass} />
                <span className="mt-1.5 flex gap-1.5">
                  {QUICK_CASH.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCash(String(amount))}
                      className={`rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${cash !== '' && cashValue === amount ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                    >
                      ₹{amount.toLocaleString('en-IN')}
                    </button>
                  ))}
                </span>
              </Field>
            </div>
          </FormCard>
          <FormActions submitText="Open shift" isSubmitting={open.isPending} />
        </form>
      )}
    </div>
  );
}
