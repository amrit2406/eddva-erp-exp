import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard, Toggle } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { rupees } from '../../../../utils/dashboardFormat';
import { getMenuCategories, getMenuItems } from '../../api/canteen.api';
import type { FoodType, MenuItemFormData } from '../../types/canteen.types';
import { FOOD_TYPE, WEEK_DAYS } from '../../utils/labels';
import { FoodMark, ItemThumb } from './FoodMark';

const TAX_PRESETS = [0, 5, 12, 18];
const EVERY_DAY = WEEK_DAYS.map((d) => d.code);

interface ItemFormProps {
  defaultValues?: MenuItemFormData;
  itemId?: string;
  // Pre-chosen category for a new item (e.g. opened from a category page).
  initialCategoryId?: string;
  onSubmit: (data: MenuItemFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function ItemForm({ defaultValues, itemId, initialCategoryId, onSubmit, submitText, isSubmitting }: ItemFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });
  const { data: items = [] } = useQuery({ queryKey: ['canteen', 'menu-items'], queryFn: () => getMenuItems() });

  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? initialCategoryId ?? '');
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [price, setPrice] = useState(defaultValues ? String(defaultValues.price) : '');
  const [taxRate, setTaxRate] = useState(defaultValues ? String(defaultValues.taxRate) : '0');
  const [foodType, setFoodType] = useState<FoodType>(defaultValues?.foodType ?? 'VEG');
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? '');
  const [days, setDays] = useState<string[]>(defaultValues?.availableDays ? defaultValues.availableDays.split(',').map((d) => d.trim()) : EVERY_DAY);
  const [isAvailable, setIsAvailable] = useState(defaultValues?.isAvailable ?? true);
  const [showErrors, setShowErrors] = useState(false);

  const priceValue = Number(price);
  const taxValue = Number(taxRate);
  const duplicate = items.find((i) => i.id !== itemId && i.name.trim().toLowerCase() === name.trim().toLowerCase());
  const errors = {
    categoryId: !categoryId ? 'Choose a category' : undefined,
    name: !name.trim() ? 'Enter a name' : duplicate ? `“${duplicate.name}” is already on the menu` : undefined,
    price: price.trim() === '' || !(priceValue > 0) ? 'Enter a price above ₹0' : undefined,
    taxRate: taxRate.trim() === '' || taxValue < 0 || taxValue > 100 ? 'Enter a rate between 0 and 100' : undefined,
    imageUrl: imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim()) ? 'Paste a full web address starting with http' : undefined,
    days: days.length === 0 ? 'Pick at least one day' : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  const toggleDay = (code: string) => setDays((current) => (current.includes(code) ? current.filter((d) => d !== code) : [...current, code]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
      taxRate: taxValue,
      foodType,
      imageUrl: imageUrl.trim(),
      isAvailable,
      // Keep the week order the API uses.
      availableDays: EVERY_DAY.filter((d) => days.includes(d)).join(','),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Item">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" error={duplicate ? errors.name : show(errors.name)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Veg Burger" autoFocus={!defaultValues} className={inputClass} />
          </Field>
          <Field label="Category" error={show(errors.categoryId)}>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <Link to="/canteen/menu/categories/new" className="mt-1 inline-block text-xs font-medium text-brand hover:text-brand-navy">
                Add a category first
              </Link>
            )}
          </Field>
          <Field label="Description (optional)" className="md:col-span-2">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What's in it, portion size…" className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Food type</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Food type">
              {(Object.keys(FOOD_TYPE) as FoodType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={foodType === type}
                  onClick={() => setFoodType(type)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium ring-1 transition ${foodType === type ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  <FoodMark type={type} /> {FOOD_TYPE[type].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FormCard>

      <FormCard title="Price">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr] md:max-w-2xl">
          <Field label="Price (₹)" error={show(errors.price)}>
            <input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 60" className={inputClass} />
          </Field>
          <Field label="Tax (GST %)" error={show(errors.taxRate)}>
            <input type="number" min={0} max={100} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputClass} />
            <span className="mt-1.5 flex gap-1.5">
              {TAX_PRESETS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxRate(String(rate))}
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ${taxValue === rate && taxRate !== '' ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {rate}%
                </button>
              ))}
            </span>
          </Field>
        </div>
        {priceValue > 0 && !errors.taxRate && (
          <p className="mt-3 text-sm text-slate-600">
            Member pays <span className="font-semibold text-slate-900">{rupees(Math.round(priceValue * (1 + taxValue / 100) * 100) / 100)}</span>
            {taxValue > 0 && <span className="text-slate-500"> ({rupees(priceValue)} + {taxValue}% tax)</span>}
          </p>
        )}
      </FormCard>

      <FormCard title="When it's sold">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Days</span>
              <button type="button" onClick={() => setDays(days.length === 7 ? [] : EVERY_DAY)} className="text-xs font-medium text-brand hover:text-brand-navy">
                {days.length === 7 ? 'Clear all' : 'Every day'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((d) => {
                const on = days.includes(d.code);
                return (
                  <button
                    key={d.code}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleDay(d.code)}
                    className={`w-14 rounded-xl py-2 text-sm font-medium ring-1 transition ${on ? 'bg-brand-navy text-white ring-brand-navy' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {show(errors.days) && <p className="mt-1 text-xs text-red-600">{errors.days}</p>}
          </div>
          <Toggle label="On the menu now" description={isAvailable ? 'Staff can add it to orders.' : 'Hidden from new orders until you turn it on.'} checked={isAvailable} onChange={setIsAvailable} />
        </div>
      </FormCard>

      <FormCard title="Photo (optional)">
        <div className="flex items-start gap-4">
          <ItemThumb key={imageUrl} src={errors.imageUrl ? '' : imageUrl.trim()} alt={name || 'Item photo'} size="lg" />
          <Field label="Image link" error={show(errors.imageUrl)} hint="Paste a link to a photo of the dish." className="flex-1">
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={inputClass} />
          </Field>
        </div>
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
