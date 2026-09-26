import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Lock, Percent, Power, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import ItemsUsingList from '../../components/items/ItemsUsingList';
import { deleteTaxCode, getTaxCode, setTaxCodeActive } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatRate, TAX_KIND_LABEL, taxKind, totalRate } from '../../utils/taxCode';
import { toNumber } from '../../../../utils/dashboardFormat';

export default function TaxCodeDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const key = ['sales-purchase', 'tax-code', id];
  const { data: tax, isLoading, error, refetch } = useQuery({ queryKey: key, queryFn: () => getTaxCode(id), enabled: Boolean(id) });

  const toggle = useMutation({
    mutationFn: () => setTaxCodeActive(id, !tax?.is_active),
    onSuccess: () => {
      toast.success(`${tax?.name} turned ${tax?.is_active ? 'off' : 'on'}`);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'tax-codes'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change this tax code')),
  });

  const remove = useMutation({
    mutationFn: () => deleteTaxCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'tax-codes'] });
      toast.success(`${tax?.name} deleted`);
      navigate('/sales-purchase/tax-codes');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this tax code')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/tax-codes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Tax codes
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !tax) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load tax code')} onRetry={() => refetch()} />
      </div>
    );
  }

  const kind = taxKind(tax);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Percent}
        title={tax.name}
        status={<StatusPill label={tax.is_active ? 'In use' : 'Turned off'} color={tax.is_active ? '#15936a' : '#94a3b8'} />}
        meta={`${formatRate(totalRate(tax))} in total · starts ${longDate(tax.effective_from)}`}
        actions={
          <>
            <button type="button" onClick={() => toggle.mutate()} disabled={toggle.isPending} className={btnSecondary}>
              <Power className="h-4 w-4" /> {tax.is_active ? 'Turn off' : 'Turn on'}
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      >
        {kind === 'mixed' ? (
          <NextStep tone="bad">CGST, SGST and IGST are all set on this code, so all three are charged together ({formatRate(totalRate(tax))}). Usually it's CGST + SGST or IGST — consider turning this off and adding a corrected code.</NextStep>
        ) : !tax.is_active ? (
          <NextStep>This code is turned off, so it can't be picked for new items or invoices. Past invoices keep it.</NextStep>
        ) : null}
      </DetailHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard
          title="Rate"
          icon={Percent}
          rows={[
            ['Type', <StatusPill key="k" {...TAX_KIND_LABEL[kind]} />],
            ['CGST', formatRate(toNumber(tax.cgst_pct))],
            ['SGST', formatRate(toNumber(tax.sgst_pct))],
            ['IGST', formatRate(toNumber(tax.igst_pct))],
            ['Total charged', <span key="t" className="text-base">{formatRate(totalRate(tax))}</span>],
          ]}
        >
          <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> Rates can't be edited, because past invoices depend on them.
          </p>
        </InfoCard>
        <div className="lg:col-span-2">
          <ItemsUsingList title="Items using this tax code" filter={(i) => i.tax_code_id === tax.tax_code_id} emptyText="No items use this tax code yet." />
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this tax code?"
        message={`“${tax.name}” will be removed. If items or past invoices use it, turning it off is safer.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete tax code'}
      />
    </div>
  );
}
