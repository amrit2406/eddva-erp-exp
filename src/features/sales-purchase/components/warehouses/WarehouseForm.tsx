import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard, Toggle } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getWarehouses } from '../../api/sales-purchase.api';
import type { WarehouseFormData } from '../../types/sales-purchase.types';

interface WarehouseFormProps {
  defaultValues?: WarehouseFormData;
  warehouseId?: number;
  onSubmit?: (data: WarehouseFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

export default function WarehouseForm({ defaultValues, warehouseId, onSubmit, submitText = 'Save', isSubmitting = false }: WarehouseFormProps) {
  const { data: warehouses = [] } = useQuery({ queryKey: ['sales-purchase', 'warehouses'], queryFn: getWarehouses });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [address, setAddress] = useState(defaultValues?.address ?? '');
  const [isDefault, setIsDefault] = useState(defaultValues?.is_default ?? false);
  const [showErrors, setShowErrors] = useState(false);

  const duplicate = warehouses.find((w) => w.warehouse_id !== warehouseId && w.name.trim().toLowerCase() === name.trim().toLowerCase());
  const currentDefault = warehouses.find((w) => w.is_default && w.warehouse_id !== warehouseId);
  const nameError = !name.trim() ? 'Enter a name' : duplicate ? `“${duplicate.name}” already exists` : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) {
      setShowErrors(true);
      return;
    }
    onSubmit?.({ name: name.trim(), address: address.trim(), is_default: isDefault });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4">
          <Field label="Name" error={duplicate || showErrors ? nameError : undefined}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Store, Science Block Store" autoFocus className={inputClass} />
          </Field>
          <Field label="Address (optional)" hint="Where deliveries should be brought.">
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Building, floor, campus" className={inputClass} />
          </Field>
          <Toggle
            label="Default warehouse"
            description={
              isDefault && currentDefault
                ? `Replaces “${currentDefault.name}” as the default for new purchase orders.`
                : 'New purchase orders deliver here unless someone picks another.'
            }
            checked={isDefault}
            onChange={setIsDefault}
          />
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
