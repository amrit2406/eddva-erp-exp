import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getHouses, getStaffList, getParticipants } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { TeamFormData, TeamMemberInput, House, SportsStaff, SportsParticipant } from '../../types/sports.types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateTeamModal({ isOpen, onClose, onSubmit, isLoading }: CreateTeamModalProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [staff, setStaff] = useState<SportsStaff[]>([]);
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [formData, setFormData] = useState<TeamFormData>({ team_name: '', house_id: undefined, coach_id: undefined, members: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getHouses().then(setHouses).catch(() => setHouses([]));
      getStaffList().then(setStaff).catch(() => setStaff([]));
      getParticipants().then(setParticipants).catch(() => setParticipants([]));
      setFormData({ team_name: '', house_id: undefined, coach_id: undefined, members: [] });
      setError(null);
    }
  }, [isOpen]);

  function addMemberRow() {
    setFormData((prev) => ({ ...prev, members: [...(prev.members ?? []), { participant_id: 0, role: 'player' }] }));
  }

  function updateMemberRow(index: number, patch: Partial<TeamMemberInput>) {
    setFormData((prev) => ({
      ...prev,
      members: (prev.members ?? []).map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  function removeMemberRow(index: number) {
    setFormData((prev) => ({ ...prev, members: (prev.members ?? []).filter((_, i) => i !== index) }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const members = (formData.members ?? []).filter((m) => m.participant_id > 0);
    try {
      await onSubmit({ ...formData, members });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create team'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Team" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Team Name *</label>
          <input
            type="text"
            required
            value={formData.team_name}
            onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
            placeholder="e.g., Falcon Senior XI"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">House</label>
            <select
              value={formData.house_id ?? ''}
              onChange={(e) => setFormData({ ...formData, house_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {houses.map((h) => (
                <option key={h.house_id} value={h.house_id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Coach</label>
            <select
              value={formData.coach_id ?? ''}
              onChange={(e) => setFormData({ ...formData, coach_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {staff.map((s) => (
                <option key={s.staff_id} value={s.staff_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Members</label>
            <button type="button" onClick={addMemberRow} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Member
            </button>
          </div>
          <div className="space-y-2">
            {(formData.members ?? []).map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={member.participant_id || ''}
                  onChange={(e) => updateMemberRow(index, { participant_id: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select participant</option>
                  {participants.map((p) => (
                    <option key={p.participant_id} value={p.participant_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={member.role ?? 'player'}
                  onChange={(e) => updateMemberRow(index, { role: e.target.value })}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="captain">Captain</option>
                  <option value="player">Player</option>
                  <option value="substitute">Substitute</option>
                </select>
                <button type="button" onClick={() => removeMemberRow(index)} className="text-slate-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(formData.members ?? []).length === 0 && (
              <p className="text-xs text-slate-500">No members added yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
