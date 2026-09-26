import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getMenuCategories } from '../../api/canteen.api';
import type { MenuCategoryFormData } from '../../types/canteen.types';

interface CategoryFormProps {
  defaultValues?: MenuCategoryFormData;
  categoryId?: string;
  onSubmit: (data: MenuCategoryFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function CategoryForm({ defaultValues, categoryId, onSubmit, submitText, isSubmitting }: CategoryFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['canteen', 'menu-categories'], queryFn: () => getMenuCategories() });
  const nextPosition = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0) + 1;
  const [name, setName] = useState(defaultValues?.name ?? '');
  // Empty until typed, so a new category lands at the end of the menu by default.
  const [position, setPosition] = useState(defaultValues ? String(defaultValues.displayOrder) : '');
  const [showErrors, setShowErrors] = useState(false);

  const duplicate = categories.find((c) => c.id !== categoryId && c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const nameError = !name.trim() ? 'Enter a name' : duplicate ? `“${duplicate.name}” already exists` : undefined;
  const positionValue = position.trim() === '' ? nextPosition : Number(position);
  const positionError = !Number.isInteger(positionValue) || positionValue < 0 ? 'Use a whole number, e.g. 1' : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError || positionError) {
      setShowErrors(true);
      return;
    }
    onSubmit({ name: name.trim(), displayOrder: positionValue });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-[1fr_180px]">
          <Field label="Name" error={duplicate || showErrors ? nameError : undefined}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Snacks, Beverages, Meals" autoFocus className={inputClass} />
          </Field>
          <Field label="Position on menu" error={showErrors ? positionError : undefined} hint="1 shows first.">
            <input type="number" min={0} step={1} value={position} onChange={(e) => setPosition(e.target.value)} placeholder={String(nextPosition)} className={inputClass} />
          </Field>
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
