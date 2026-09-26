import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getMembers } from '../../api/canteen.api';
import type { CanteenMemberFormData, MemberType } from '../../types/canteen.types';
import { MEMBER_TYPE } from '../../utils/labels';

interface MemberFormProps {
  defaultValues?: CanteenMemberFormData;
  memberId?: string;
  onSubmit: (data: CanteenMemberFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function MemberForm({ defaultValues, memberId, onSubmit, submitText, isSubmitting }: MemberFormProps) {
  const { data: members = [] } = useQuery({ queryKey: ['canteen', 'members'], queryFn: () => getMembers() });
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [memberType, setMemberType] = useState<MemberType>(defaultValues?.memberType ?? 'STUDENT');
  const [barcode, setBarcode] = useState(defaultValues?.idCardBarcode ?? '');
  const [externalRefId, setExternalRefId] = useState(defaultValues?.externalRefId ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const others = members.filter((m) => m.id !== memberId);
  const sameCard = barcode.trim() && others.find((m) => m.idCardBarcode.trim().toLowerCase() === barcode.trim().toLowerCase());
  const sameRef = externalRefId.trim() && others.find((m) => m.externalRefId.trim().toLowerCase() === externalRefId.trim().toLowerCase());
  const errors = {
    name: !name.trim() ? 'Enter the name' : undefined,
    barcode: !barcode.trim() ? 'Enter or scan the ID card number' : sameCard ? `Already used by ${sameCard.name}` : undefined,
    externalRefId: !externalRefId.trim() ? 'Enter their school ID' : sameRef ? `Already used by ${sameRef.name}` : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    onSubmit({ name: name.trim(), memberType, idCardBarcode: barcode.trim(), externalRefId: externalRefId.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard>
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Field label="Full name" error={show(errors.name)} className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" autoFocus={!defaultValues} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Who are they?</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Member type">
              {(Object.keys(MEMBER_TYPE) as MemberType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={memberType === type}
                  onClick={() => setMemberType(type)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ring-1 transition ${memberType === type ? 'bg-brand/5 text-slate-900 ring-2 ring-brand' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'}`}
                >
                  {MEMBER_TYPE[type].label}
                </button>
              ))}
            </div>
          </div>
          <Field label="ID card number" error={sameCard ? errors.barcode : show(errors.barcode)} hint="Scan the card's barcode or type the number.">
            <input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="e.g. BC1001" autoComplete="off" className={inputClass} />
          </Field>
          <Field label={memberType === 'STUDENT' ? 'Admission / roll no.' : memberType === 'GUEST' ? 'Guest reference' : 'Employee ID'} error={sameRef ? errors.externalRefId : show(errors.externalRefId)} hint="The ID used elsewhere in the school.">
            <input value={externalRefId} onChange={(e) => setExternalRefId(e.target.value)} placeholder="e.g. STU-1001" autoComplete="off" className={inputClass} />
          </Field>
        </div>
      </FormCard>
      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
