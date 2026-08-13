import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemForm from '../../components/items/ItemForm';
import { getItem, updateItem, getItemCategories, getUOMs, getTaxCodes } from '../../api/sales-purchase.api';
import type { ItemFormData, ItemCategory, UOM, TaxCode } from '../../types/sales-purchase.types';

export default function EditItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<ItemFormData | null>(null);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (itemId: string) => {
    try {
      setLoading(true);
      const [itemData, categoriesData, uomsData, taxCodesData] = await Promise.all([
        getItem(itemId),
        getItemCategories(),
        getUOMs(),
        getTaxCodes(),
      ]);
      setDefaultValues({
        itemCode: itemData.itemCode,
        itemName: itemData.itemName,
        categoryId: itemData.categoryId,
        uomId: itemData.uomId,
        quantity: itemData.quantity,
        hsnSacCode: itemData.hsnSacCode,
        purchasePrice: itemData.purchasePrice,
        salesPrice: itemData.salesPrice,
        taxCodeId: itemData.taxCodeId,
      });
      setCategories(categoriesData);
      setUOMs(uomsData);
      setTaxCodes(taxCodesData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ItemFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateItem(id, data);
      navigate('/sales-purchase/items');
    } catch (error: any) {
      console.error('Failed to update item:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/items">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Item</h1>
          <p className="text-slate-600 mt-1">Update item details</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : defaultValues ? (
            <ItemForm 
              onSubmit={handleSubmit} 
              submitText="Update Item"
              defaultValues={defaultValues}
              categories={categories}
              uoms={uoms}
              taxCodes={taxCodes}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="text-center py-8 text-slate-500">Failed to load item data</div>
          )}
        </div>
      </Card>
    </div>
  );
}
