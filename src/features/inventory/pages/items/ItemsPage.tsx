import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import ItemTable from '../../components/items/ItemTable';
import { getItems } from '../../api/items.api';
import { getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ITEM_TYPE_OPTIONS } from '../../constants/item.constants';
import type { InventoryItem, InventoryItemPagination, InventoryItemType } from '../../types/item.types';
import type { InventoryCategory } from '../../types/category.types';

export default function ItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<InventoryItemPagination | null>(null);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [itemType, setItemType] = useState<InventoryItemType | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, itemType]);

  useEffect(() => {
    const timeout = setTimeout(loadItems, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, itemType, page]);

  async function loadItems() {
    try {
      setLoading(true);
      const result = await getItems({
        search: search || undefined,
        category_id: categoryId || undefined,
        item_type: itemType || undefined,
        page,
        limit: 25,
      });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load items'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Items</h1>
          <p className="text-slate-600 mt-1">Manage inventory item master records</p>
        </div>
        <Link to="/inventory/items/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or code..."
            className="flex-1"
          />
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            placeholder="All Categories"
            options={categories.map((c) => ({ value: String(c.category_id), label: c.name }))}
            className="w-full sm:w-48"
          />
          <Select
            value={itemType}
            onChange={(e) => setItemType(e.target.value as InventoryItemType | '')}
            placeholder="All Types"
            options={ITEM_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-40"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <ItemTable items={items} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
