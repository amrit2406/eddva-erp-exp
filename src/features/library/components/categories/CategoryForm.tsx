import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getCategories } from '../../api/library.api';
import type { CategoryFormData } from '../../types/library.types';

interface CategoryFormProps {
  defaultValues?: CategoryFormData;
  categoryId?: number;
  onSubmit: (data: CategoryFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function CategoryForm({ defaultValues, categoryId, onSubmit, submitText, isSubmitting }: CategoryFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['library', 'categories'], queryFn: getCategories });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const duplicate = categories.find((c) => c.category_id !== categoryId && c.name.trim().toLowerCase() === name.trim().toLowerCase());
  const error = !name.trim() ? 'Enter a name' : name.trim().length > 100 ? 'Keep it under 100 characters' : duplicate ? `“${duplicate.name}” already exists` : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) {
      setShowErrors(true);
      return;
    }
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="max-w-md">
          <Field label="Name" error={duplicate || showErrors ? error : undefined}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fiction, Science, Reference" autoFocus className={inputClass} />
          </Field>
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
