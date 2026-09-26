import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, LayoutGrid, Pencil, Plus, Utensils } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, longDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { FoodMark, ItemThumb } from '../../components/menu/FoodMark';
import { getMenuCategory, getMenuItems } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';

export default function MenuCategoryDetailsPage() {
  const { id = '' } = useParams();
  const { data: category, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-category', id], queryFn: () => getMenuCategory(id), enabled: Boolean(id) });
  const { data: items = [] } = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });

  const back = (
    <Link to="/canteen/menu/categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Menu categories
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !category) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load category')} onRetry={() => refetch()} />
      </div>
    );
  }

  const inCategory = items.filter((i) => i.categoryId === category.id).sort((a, b) => a.name.localeCompare(b.name));
  const available = inCategory.filter((i) => i.isAvailable).length;
  const addItem = `/canteen/menu/items/new?categoryId=${category.id}`;

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={LayoutGrid}
        title={category.name}
        meta={`Position ${category.displayOrder} on the menu · Added ${longDate(category.createdAt)}`}
        actions={
          <>
            <Link to={addItem} className={btnSecondary}>
              <Plus className="h-4 w-4" /> Add item
            </Link>
            <Link to={`/canteen/menu/categories/${category.id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      />

      <InfoCard title={`Items in this category · ${inCategory.length}`} icon={Utensils} action={inCategory.length > 0 && <span className="text-xs text-slate-500">{available} available now</span>}>
        {inCategory.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-sm text-slate-500">Nothing on the menu here yet.</p>
            <Link to={addItem} className={btnPrimary}>
              <Plus className="h-4 w-4" /> Add the first item
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {inCategory.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
                <ItemThumb src={item.imageUrl} alt={item.name} size="sm" />
                <FoodMark type={item.foodType} />
                <Link to={`/canteen/menu/items/${item.id}`} className="min-w-0 truncate font-medium text-brand-navy hover:text-brand">
                  {item.name}
                </Link>
                <span className="ml-auto whitespace-nowrap font-medium tabular-nums text-slate-900">{rupees(toNumber(item.price))}</span>
                <StatusPill label={item.isAvailable ? 'Available' : 'Off menu'} color={item.isAvailable ? '#15936a' : '#94a3b8'} />
              </li>
            ))}
          </ul>
        )}
      </InfoCard>
    </div>
  );
}
