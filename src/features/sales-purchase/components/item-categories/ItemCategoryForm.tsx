import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { getItemCategories } from '../../api/sales-purchase.api';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';

interface ItemCategoryFormProps {
  defaultValues?: ItemCategoryFormData;
  // The category being edited, so its own name doesn't count as a duplicate.
  categoryId?: number;
  onSubmit?: (data: ItemCategoryFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

// One field: the category name, with a same-name check.
export default function ItemCategoryForm({ defaultValues, categoryId, onSubmit, submitText = 'Save', isSubmitting = false }: ItemCategoryFormProps) {
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery({ queryKey: ['sales-purchase', 'item-categories'], queryFn: getItemCategories });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const duplicate = categories.find((c) => c.category_id !== categoryId && c.name.trim().toLowerCase() === trimmed.toLowerCase());
  const error = !trimmed ? 'Enter a category name' : duplicate ? `“${duplicate.name}” already exists` : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ name: trimmed });
  };

  const visibleError = duplicate ? error : showErrors ? error : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70">
        <label className="block max-w-md">
          <span className="mb-1 block text-sm font-medium text-slate-700">Category name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Stationery, Furniture, Lab Equipment"
            autoFocus
            className="w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {visibleError ? (
            <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" /> {visibleError}
            </span>
          ) : (
            <span className="mt-1 block text-xs text-slate-500">Used to group similar items together.</span>
          )}
        </label>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-brand-navy to-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitText}
        </button>
      </div>
    </form>
  );
}
