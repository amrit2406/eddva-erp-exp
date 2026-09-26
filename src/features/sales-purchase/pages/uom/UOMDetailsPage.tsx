import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Ruler } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton } from '../../../../components/premium/detail/DetailParts';
import { btnSecondary, longDate } from '../../../../components/premium/styles';
import ItemsUsingList from '../../components/items/ItemsUsingList';
import { getUOM } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function UOMDetailsPage() {
  const { id = '' } = useParams();
  const { data: unit, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'uom', id], queryFn: () => getUOM(id), enabled: Boolean(id) });

  const back = (
    <Link to="/sales-purchase/uom" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Units of measure
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !unit) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load unit')} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={Ruler}
        title={unit.name}
        status={<code className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-700">{unit.symbol}</code>}
        meta={`Added ${longDate(unit.created_at)}`}
        actions={
          <Link to={`/sales-purchase/uom/${unit.uom_id}/edit`} className={btnSecondary}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />
      <ItemsUsingList title="Items measured in this unit" filter={(i) => i.uom_id === unit.uom_id} emptyText="No items use this unit yet." />
    </div>
  );
}
