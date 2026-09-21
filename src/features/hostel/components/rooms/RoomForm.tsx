import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import BlockSelect from '../blocks/BlockSelect';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import type { RoomFormData } from '../../types/hostel.types';

interface RoomFormProps {
  initialValues: RoomFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  // A room can't move to another block once created.
  lockBlock?: boolean;
  onSubmit: (data: RoomFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const ROOM_TYPE_SUGGESTIONS = ['single', 'double', 'triple', 'dormitory'];

export default function RoomForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  lockBlock,
  onSubmit,
  onCancel,
}: RoomFormProps) {
  const [form, setForm] = useState<RoomFormData>(initialValues);
  const { blocks, loaded } = useBlockOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, floor: Number(form.floor), capacity: Number(form.capacity) });
  };

  const numberValue = (value: number) => (Number.isNaN(value) ? '' : value);
  const numberChange = (raw: string) => (raw === '' ? NaN : Number(raw));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="block_id" className="block text-sm font-medium text-slate-700 mb-1">
            Block *
          </label>
          <BlockSelect
            id="block_id"
            value={form.block_id}
            onChange={(block_id) => setForm({ ...form, block_id })}
            blocks={blocks}
            loaded={loaded}
            placeholder="Select a block"
            required
            disabled={lockBlock}
          />
        </div>

        <div>
          <label htmlFor="room_number" className="block text-sm font-medium text-slate-700 mb-1">
            Room Number *
          </label>
          <input
            id="room_number"
            type="text"
            value={form.room_number}
            onChange={(e) => setForm({ ...form, room_number: e.target.value })}
            placeholder="e.g. A-101"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-slate-700 mb-1">
            Floor *
          </label>
          <input
            id="floor"
            type="number"
            min={0}
            step={1}
            value={numberValue(form.floor)}
            onChange={(e) => setForm({ ...form, floor: numberChange(e.target.value) })}
            placeholder="e.g. 1"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="room_type" className="block text-sm font-medium text-slate-700 mb-1">
            Room Type *
          </label>
          <input
            id="room_type"
            type="text"
            list="room-types"
            value={form.room_type}
            onChange={(e) => setForm({ ...form, room_type: e.target.value })}
            placeholder="e.g. double"
            className={inputClass}
            required
          />
          <datalist id="room-types">
            {ROOM_TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">
            Capacity (beds) *
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            step={1}
            value={numberValue(form.capacity)}
            onChange={(e) => setForm({ ...form, capacity: numberChange(e.target.value) })}
            placeholder="e.g. 2"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
