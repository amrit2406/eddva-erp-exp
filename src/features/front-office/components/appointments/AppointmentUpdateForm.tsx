import { useState } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { getVisitors } from '../../api/visitors.api';
import { cn } from '../../../../utils/cn';
import type { AppointmentUpdateFormData } from '../../types/appointmentRecord.types';
import type { FrontOfficeVisitor } from '../../types/visitorRecord.types';

interface AppointmentUpdateFormProps {
  formData: AppointmentUpdateFormData;
  onChange: (data: AppointmentUpdateFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export default function AppointmentUpdateForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitText = 'Save',
  isSubmitting = false,
  className,
}: AppointmentUpdateFormProps) {
  const [visitorQuery, setVisitorQuery] = useState('');
  const [visitorResults, setVisitorResults] = useState<FrontOfficeVisitor[]>([]);

  function handleQueryChange(value: string) {
    setVisitorQuery(value);
    if (!value.trim()) {
      setVisitorResults([]);
      return;
    }
    getVisitors({ search: value.trim() }).then((r) => setVisitorResults(r.data)).catch(() => setVisitorResults([]));
  }

  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Link to Existing Visitor</label>
        <Input
          value={visitorQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by name, phone, email..."
        />
        {visitorResults.length > 0 && (
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
            {visitorResults.map((v) => (
              <button
                key={v.visitor_id}
                type="button"
                onClick={() => {
                  onChange({ ...formData, visitor_id: v.visitor_id, visitor_name: v.full_name, phone: v.phone || '' });
                  setVisitorQuery('');
                  setVisitorResults([]);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
              >
                <span className="font-medium text-slate-900">{v.full_name}</span>
                <span className="text-slate-500"> — {v.phone || v.email}</span>
              </button>
            ))}
          </div>
        )}
        {formData.visitor_id ? (
          <p className="text-xs text-green-700">Linked to visitor #{formData.visitor_id}.</p>
        ) : (
          <p className="text-xs text-slate-500">Not linked to a registered visitor record.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Visitor Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.visitor_name ?? ''}
            onChange={(e) => onChange({ ...formData, visitor_name: e.target.value })}
            placeholder="Enter visitor name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <Input
            value={formData.phone ?? ''}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
          <Input
            value={formData.purpose ?? ''}
            onChange={(e) => onChange({ ...formData, purpose: e.target.value })}
            placeholder="Enter appointment purpose"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Date, time, and host cannot be changed here — use the Reschedule action on the appointment detail page.
      </p>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
