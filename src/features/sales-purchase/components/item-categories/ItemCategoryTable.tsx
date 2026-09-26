import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import type { ItemCategory } from '../../types/sales-purchase.types';

const shortDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function StatusPill({ status }: { status: ItemCategory['status'] }) {
  const active = status !== 'INACTIVE';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

interface ItemCategoryTableProps {
  categories: ItemCategory[];
  // How many items sit in each category (by category_id).
  itemCounts: Map<number, number>;
  onDelete: (category: ItemCategory) => void;
}

export default function ItemCategoryTable({ categories, itemCounts, onDelete }: ItemCategoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-3 pl-5 pr-3">Category</th>
            <th className="px-3 py-3">Items</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Added on</th>
            <th className="py-3 pl-3 pr-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((category) => {
            const path = `/sales-purchase/item-categories/${category.category_id}`;
            const count = itemCounts.get(category.category_id) ?? 0;
            return (
              <tr key={category.category_id} className="transition-colors hover:bg-slate-50/80">
                <td className="py-3.5 pl-5 pr-3">
                  <Link to={path} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                    {category.name}
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-slate-700 tabular-nums">
                  {count} item{count === 1 ? '' : 's'}
                </td>
                <td className="px-3 py-3.5">
                  <StatusPill status={category.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">{shortDate(category.created_at)}</td>
                <td className="py-3.5 pl-3 pr-5">
                  <div className="flex items-center justify-end gap-0.5">
                    <IconAction icon={Eye} label="View category" to={path} tone="brand" />
                    <IconAction icon={Pencil} label="Rename category" to={`${path}/edit`} />
                    <IconAction icon={Trash2} label="Delete category" tone="danger" onClick={() => onDelete(category)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
