import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, Pencil, Tags, Trash2 } from 'lucide-react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard, NextStep } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnQuietDanger, btnSecondary, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { deleteItem, getItem } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatRate, taxBreakdown, totalRate } from '../../utils/taxCode';

const linkClass = 'text-brand-navy hover:text-brand hover:underline';

export default function ItemDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data: item, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'item', id], queryFn: () => getItem(id), enabled: Boolean(id) });

  const remove = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'items'] });
      toast.success(`“${item?.item_name}” deleted`);
      navigate('/sales-purchase/items');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this item')),
    onSettled: () => setConfirmDelete(false),
  });

  const back = (
    <Link to="/sales-purchase/items" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Items
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !item) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load item')} onRetry={() => refetch()} />
      </div>
    );
  }

  const buy = toNumber(item.purchase_price);
  const sell = toNumber(item.sales_price);
  const margin = sell - buy;
  const rate = item.tax_code ? totalRate(item.tax_code) : 0;
  const unit = item.uom?.symbol ?? item.uom?.name ?? 'unit';

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Package}
        title={item.item_name}
        status={<StatusPill label={item.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={item.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} />}
        meta={
          <>
            <span className="font-mono">{item.item_code}</span> · added {longDate(item.created_at)}
          </>
        }
        actions={
          <>
            <Link to={`/sales-purchase/items/${item.item_id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnQuietDanger}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      >
        {margin < 0 && <NextStep tone="bad">This item sells for {rupees(-margin)} less than it costs to buy. Check the prices.</NextStep>}
      </DetailHeader>

      <div className="grid gap-5 md:grid-cols-2">
        <InfoCard
          title="Price"
          icon={FaIndianRupeeSign}
          rows={[
            ['Buying price', `${rupees(buy)} per ${unit}`],
            ['Selling price', `${rupees(sell)} per ${unit}`],
            ['Margin (before tax)', <span key="m" className={margin < 0 ? 'text-red-600' : 'text-emerald-700'}>{`${rupees(margin)}${buy > 0 ? ` · ${Math.round((margin / buy) * 100)}%` : ''}`}</span>],
            ['Selling price with tax', rupees(sell * (1 + rate / 100))],
          ]}
        />
        <InfoCard
          title="Classification"
          icon={Tags}
          delay={60}
          rows={[
            [
              'Category',
              item.category ? (
                <Link key="c" to={`/sales-purchase/item-categories/${item.category_id}`} className={linkClass}>
                  {item.category.name}
                </Link>
              ) : (
                '—'
              ),
            ],
            [
              'Counted in',
              item.uom ? (
                <Link key="u" to={`/sales-purchase/uom/${item.uom_id}`} className={linkClass}>
                  {item.uom.name} ({item.uom.symbol})
                </Link>
              ) : (
                '—'
              ),
            ],
            [
              'Tax',
              item.tax_code ? (
                <Link key="t" to={`/sales-purchase/tax-codes/${item.tax_code_id}`} className={linkClass}>
                  {item.tax_code.name} · {formatRate(rate)}
                  <span className="block text-xs font-normal text-slate-500">{taxBreakdown(item.tax_code)}</span>
                </Link>
              ) : (
                '—'
              ),
            ],
            ['HSN / SAC', item.hsn_sac_code ? <span key="h" className="font-mono">{item.hsn_sac_code}</span> : '—'],
          ]}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => !remove.isPending && setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete this item?"
        message={`“${item.item_name}” will be removed. If orders or invoices use it, the delete may be refused.`}
        confirmText={remove.isPending ? 'Deleting…' : 'Delete item'}
      />
    </div>
  );
}
