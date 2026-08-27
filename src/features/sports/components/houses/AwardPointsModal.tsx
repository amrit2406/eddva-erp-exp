import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AwardHousePointsFormData, HousePointSourceType } from '../../types/sports.types';

interface AwardPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AwardHousePointsFormData) => Promise<void>;
  isLoading?: boolean;
}

const SOURCE_TYPE_OPTIONS = [
  { value: 'tournament_result', label: 'Tournament Result' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'participation', label: 'Participation' },
  { value: 'other', label: 'Other' },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function AwardPointsModal({ isOpen, onClose, onSubmit, isLoading }: AwardPointsModalProps) {
  const [formData, setFormData] = useState<AwardHousePointsFormData>({
    points: 0,
    source_type: 'tournament_result',
    source_reference_id: undefined,
    reason: '',
    awarded_date: today(),
    academic_year: '2026-27',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        points: 0,
        source_type: 'tournament_result',
        source_reference_id: undefined,
        reason: '',
        awarded_date: today(),
        academic_year: '2026-27',
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to award points'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Award / Deduct Points" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Points *</label>
            <input
              type="number"
              required
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
              placeholder="e.g., 50 (negative to deduct)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source Type *</label>
            <Select
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value as HousePointSourceType })}
              options={SOURCE_TYPE_OPTIONS}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., 1st Place in Inter-House Football 2026"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Source Reference ID</label>
            <input
              type="number"
              value={formData.source_reference_id ?? ''}
              onChange={(e) => setFormData({ ...formData, source_reference_id: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="tournament_id or fixture_id"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Awarded Date *</label>
            <input
              type="date"
              required
              value={formData.awarded_date}
              onChange={(e) => setFormData({ ...formData, awarded_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year *</label>
          <input
            type="text"
            required
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            placeholder="e.g., 2026-27"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Award Points'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
