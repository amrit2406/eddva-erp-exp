import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getUOMs } from '../../api/sales-purchase.api';
import type { UOMFormData } from '../../types/sales-purchase.types';

interface UOMFormProps {
  defaultValues?: UOMFormData;
  // The unit being edited, so its own name doesn't count as a duplicate.
  uomId?: number;
  onSubmit?: (data: UOMFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

export default function UOMForm({ defaultValues, uomId, onSubmit, submitText = 'Save', isSubmitting = false }: UOMFormProps) {
  const { data: units = [] } = useQuery({ queryKey: ['sales-purchase', 'uoms'], queryFn: getUOMs });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [symbol, setSymbol] = useState(defaultValues?.symbol ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const duplicate = units.find((u) => u.uom_id !== uomId && u.name.trim().toLowerCase() === name.trim().toLowerCase());
  const errors = {
    name: !name.trim() ? 'Enter the unit name' : duplicate ? `“${duplicate.name}” already exists` : undefined,
    symbol: symbol.trim() ? undefined : 'Enter a short symbol',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.name || errors.symbol) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ name: name.trim(), symbol: symbol.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Unit name" error={duplicate || showErrors ? errors.name : undefined}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kilogram, Box, Piece" autoFocus className={inputClass} />
          </Field>
          <Field label="Symbol" hint="Shown next to quantities, e.g. 10 kg." error={showErrors ? errors.symbol : undefined}>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. kg, box, pc" className={`${inputClass} font-mono`} />
          </Field>
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
