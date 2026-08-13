import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemForm from '../../components/items/ItemForm';
import { createItem, getItemCategories, getUOMs, getTaxCodes } from '../../api/sales-purchase.api';
import type { ItemFormData, ItemCategory, UOM, TaxCode } from '../../types/sales-purchase.types';

export default function CreateItemPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [taxCodes, setTaxCodes] = useState<TaxCode[]>([]);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categoriesData, uomsData, taxCodesData] = await Promise.all([
        getItemCategories(),
        getUOMs(),
        getTaxCodes(),
      ]);
      setCategories(categoriesData);
      setUOMs(uomsData);
      setTaxCodes(taxCodesData);
    } catch (error: any) {
      console.error('Failed to load form data:', error);
      if (error.response?.status === 401) {
        return;
      }
    }
  };

  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      await createItem(data);
      navigate('/sales-purchase/items');
    } catch (error: any) {
      console.error('Failed to create item:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create item');
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
          <h1 className="text-2xl font-bold text-slate-900">Add Item</h1>
          <p className="text-slate-600 mt-1">Create a new inventory item</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ItemForm 
            onSubmit={handleSubmit} 
            submitText="Create Item"
            categories={categories}
            uoms={uoms}
            taxCodes={taxCodes}
            isSubmitting={isSubmitting}
          />
        </div>
      </Card>
    </div>
  );
}
