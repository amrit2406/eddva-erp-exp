import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getPosTerminals } from '../../api/canteen.api';
import type { PosTerminalFormData } from '../../types/canteen.types';

interface TerminalFormProps {
  defaultValues?: PosTerminalFormData;
  terminalId?: string;
  onSubmit: (data: PosTerminalFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function TerminalForm({ defaultValues, terminalId, onSubmit, submitText, isSubmitting }: TerminalFormProps) {
  const { data: terminals = [] } = useQuery({ queryKey: ['canteen', 'terminals'], queryFn: () => getPosTerminals() });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [location, setLocation] = useState(defaultValues?.location ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const duplicate = terminals.find((t) => t.id !== terminalId && t.name.trim().toLowerCase() === name.trim().toLowerCase());
  const errors = {
    name: !name.trim() ? 'Enter a name' : duplicate ? `“${duplicate.name}” already exists` : undefined,
    location: !location.trim() ? 'Say where the counter is' : undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.name || errors.location) {
      setShowErrors(true);
      return;
    }
    onSubmit({ name: name.trim(), location: location.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Counter name" error={duplicate || showErrors ? errors.name : undefined}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Counter 1" autoFocus className={inputClass} />
          </Field>
          <Field label="Where is it?" error={showErrors ? errors.location : undefined}>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main canteen, ground floor" className={inputClass} />
          </Field>
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
