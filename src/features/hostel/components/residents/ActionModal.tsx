import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import BedSelect from './BedSelect';
import RoomBedPicker from './RoomBedPicker';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';

export interface ActionField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

// Submitted values: every field by name, plus room_id and bed_id when the
// modal has a room/bed picker (as strings; callers convert to numbers).
export type ActionValues = Record<string, string>;

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  submitLabel: string;
  fields: ActionField[];
  withRoomBed?: boolean;
  // Pick just a bed within a known room (submitted as bed_id).
  bedPicker?: { roomId: string; defaultBedId?: string };
  onClose: () => void;
  // Should throw when the request fails so the modal can show the error.
  onSubmit: (values: ActionValues) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

function ActionForm({
  description,
  submitLabel,
  fields,
  withRoomBed,
  bedPicker,
  onClose,
  onSubmit,
}: Omit<ActionModalProps, 'isOpen' | 'title'>) {
  const [values, setValues] = useState<ActionValues>(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']))
  );
  const [pick, setPick] = useState({ roomId: '', bedId: '' });
  const [bedOnly, setBedOnly] = useState(bedPicker?.defaultBedId ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      if (withRoomBed) await onSubmit({ ...values, room_id: pick.roomId, bed_id: pick.bedId });
      else if (bedPicker) await onSubmit({ ...values, bed_id: bedOnly });
      else await onSubmit(values);
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Action failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const missingRequired = fields.some((field) => field.required && !values[field.name]?.trim());
  const missingBed = (withRoomBed && (!pick.roomId || !pick.bedId)) || (bedPicker && !bedOnly);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {description && <p className="text-sm text-slate-600">{description}</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {withRoomBed && <RoomBedPicker roomId={pick.roomId} bedId={pick.bedId} onChange={setPick} />}

      {bedPicker && (
        <div>
          <label htmlFor="action_bed" className="block text-sm font-medium text-slate-700 mb-1">
            Bed *
          </label>
          <BedSelect id="action_bed" roomId={bedPicker.roomId} value={bedOnly} onChange={setBedOnly} />
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`action_${field.name}`} className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          {field.type === 'select' ? (
            <select
              id={`action_${field.name}`}
              value={values[field.name]}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              className={inputClass}
              required={field.required}
            >
              <option value="">Select</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={`action_${field.name}`}
              value={values[field.name]}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              rows={3}
              placeholder={field.placeholder}
              className={inputClass}
              required={field.required}
            />
          ) : (
            <input
              id={`action_${field.name}`}
              type={field.type}
              value={values[field.name]}
              onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
              placeholder={field.placeholder}
              className={inputClass}
              required={field.required}
            />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || missingRequired || missingBed}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function ActionModal({ isOpen, title, onClose, ...formProps }: ActionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={formProps.withRoomBed ? 'xl' : 'md'}>
      <ActionForm onClose={onClose} {...formProps} />
    </Modal>
  );
}
