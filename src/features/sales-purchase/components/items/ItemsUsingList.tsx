import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, Package, Plus } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getItems } from '../../api/sales-purchase.api';
import type { Item } from '../../types/sales-purchase.types';

interface ItemsUsingListProps {
  title: string;
  // Which items belong here, e.g. (i) => i.uom_id === 3.
  filter: (item: Item) => boolean;
  emptyText: string;
}

// "Items in this category / measured in this unit / taxed with this code".
export default function ItemsUsingList({ title, filter, emptyText }: ItemsUsingListProps) {
  const { data: all = [], isLoading } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });
  const items = all.filter(filter).sort((a, b) => a.item_name.localeCompare(b.item_name));

  return (
    <section className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70" style={{ animationDelay: '60ms' }}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {title} {!isLoading && <span className="font-normal text-slate-400">· {items.length}</span>}
        </h2>
        <Link to="/sales-purchase/items/new" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10">
          <Plus className="h-4 w-4" /> Add item
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-5">
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <Package className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 pl-5 pr-3">Item</th>
                <th className="px-3 py-3 text-right">Buying price</th>
                <th className="px-3 py-3 text-right">Selling price</th>
                <th className="py-3 pl-3 pr-5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.item_id} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3 pl-5 pr-3">
                    <Link to={`/sales-purchase/items/${item.item_id}`} className="font-medium text-slate-900 hover:text-brand">
                      {item.item_name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {item.item_code}
                      {item.category?.name && ` · ${item.category.name}`}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{rupees(toNumber(item.purchase_price))}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{rupees(toNumber(item.sales_price))}</td>
                  <td className="py-3 pl-3 pr-5">
                    <div className="flex justify-end">
                      <IconAction icon={Eye} label="View item" to={`/sales-purchase/items/${item.item_id}`} tone="brand" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
