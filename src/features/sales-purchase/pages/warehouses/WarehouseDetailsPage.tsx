import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Pencil, ShoppingCart, Star, Warehouse as WarehouseIcon } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getPurchaseOrders, getWarehouse } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { poStatusInfo } from '../../utils/poStatus';

const RECENT = 6;

export default function WarehouseDetailsPage() {
  const { id = '' } = useParams();
  const { data: warehouse, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'warehouse', id], queryFn: () => getWarehouse(id), enabled: Boolean(id) });
  const { data: orders = [] } = useQuery({ queryKey: ['sales-purchase', 'purchase-orders'], queryFn: getPurchaseOrders });

  const back = (
    <Link to="/sales-purchase/warehouses" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Warehouses
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !warehouse) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load warehouse')} onRetry={() => refetch()} />
      </div>
    );
  }

  const here = orders.filter((o) => o.warehouse_id === warehouse.warehouse_id).sort((a, b) => b.po_id - a.po_id);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={WarehouseIcon}
        title={warehouse.name}
        status={
          <>
            {warehouse.is_default && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="h-3 w-3" /> Default
              </span>
            )}
            <StatusPill label={warehouse.status === 'INACTIVE' ? 'Inactive' : 'Active'} color={warehouse.status === 'INACTIVE' ? '#94a3b8' : '#15936a'} />
          </>
        }
        meta={`Added ${longDate(warehouse.created_at)}`}
        actions={
          <Link to={`/sales-purchase/warehouses/${warehouse.warehouse_id}/edit`} className={btnSecondary}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <InfoCard title="Address" icon={MapPin}>
          <p className="text-sm text-slate-700">{warehouse.address || 'No address added yet.'}</p>
          {warehouse.is_default && <p className="mt-3 text-xs text-slate-500">New purchase orders deliver here unless someone picks another warehouse.</p>}
        </InfoCard>
        <div className="lg:col-span-2">
          <InfoCard title={`Purchase orders delivering here · ${here.length}`} icon={ShoppingCart} delay={60}>
            {here.length === 0 ? (
              <p className="text-sm text-slate-500">No purchase orders deliver here yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {here.slice(0, RECENT).map((po) => {
                  const s = poStatusInfo(po.status);
                  return (
                    <li key={po.po_id} className="flex items-center gap-3 py-2.5 text-sm">
                      <Link to={`/sales-purchase/purchase-orders/${po.po_id}`} className="font-medium text-brand-navy hover:text-brand">
                        {po.po_number}
                      </Link>
                      <span className="hidden truncate text-slate-500 sm:block">{po.vendor?.vendor_name}</span>
                      <span className="ml-auto whitespace-nowrap text-xs text-slate-400">{shortDate(po.po_date)}</span>
                      <span className="whitespace-nowrap font-medium tabular-nums text-slate-900">{rupees(toNumber(po.grand_total))}</span>
                      <StatusPill label={s.label} color={s.color} />
                    </li>
                  );
                })}
              </ul>
            )}
            {here.length > RECENT && (
              <Link to="/sales-purchase/purchase-orders" className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-navy">
                See all purchase orders
              </Link>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
