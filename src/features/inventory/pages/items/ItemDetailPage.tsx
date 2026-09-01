import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Truck, MapPin, Folder, Package } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemVendorModal from '../../components/items/ItemVendorModal';
import { getItem, getItemVendors, upsertItemVendor } from '../../api/items.api';
import { getVendors } from '../../api/vendors.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryItem, InventoryItemVendor, InventoryItemVendorFormData } from '../../types/item.types';
import type { InventoryVendor } from '../../types/vendor.types';
import { cn } from '../../../../utils/cn';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [itemVendors, setItemVendors] = useState<InventoryItemVendor[]>([]);
  const [vendors, setVendors] = useState<InventoryVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [itemData, itemVendorData, vendorData] = await Promise.all([
        getItem(id),
        getItemVendors(id),
        getVendors(),
      ]);
      setItem(itemData);
      setItemVendors(itemVendorData);
      setVendors(vendorData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load item'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVendorSubmit(data: InventoryItemVendorFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await upsertItemVendor(id, data);
      const itemVendorData = await getItemVendors(id);
      setItemVendors(itemVendorData);
      setIsVendorModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!item) {
    return <div className="text-center py-8 text-slate-500">Item not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/inventory/items" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Items
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {item.name}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 font-mono">{item.item_code}</p>
        </div>
        <Link to={`/inventory/items/${item.item_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Folder className="h-3.5 w-3.5" /> Category
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{item.category?.name ?? `#${item.category_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Type
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{item.item_type}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Unit of Measure</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{item.unit_of_measure}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Reorder Level</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{item.reorder_level}</p>
        </Card>
      </div>

      {(item.description || item.image_url) && (
        <Card className="border-slate-200 p-4">
          {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
          {item.image_url && (
            <a
              href={item.image_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#008BE9] hover:underline mt-2 inline-block"
            >
              {item.image_url}
            </a>
          )}
        </Card>
      )}

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Vendor Pricing
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsVendorModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Vendor</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Last Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                {itemVendors.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-slate-500">
                      No vendors associated with this item.
                    </td>
                  </tr>
                ) : (
                  itemVendors.map((iv) => (
                    <tr key={iv.id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{iv.vendor?.name ?? `#${iv.vendor_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {iv.last_purchase_price != null ? `₹${iv.last_purchase_price}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {item.balances && item.balances.length > 0 && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              Stock Balances
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Location</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {item.balances.map((bal) => (
                    <tr key={bal.location_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{bal.location?.name ?? `#${bal.location_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{bal.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      <ItemVendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        vendors={vendors}
        onSubmit={handleVendorSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
