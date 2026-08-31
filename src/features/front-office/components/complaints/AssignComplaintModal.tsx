import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AssignComplaintFormData } from '../../types/complaintRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

interface AssignComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: FrontOfficeEmployee[];
  currentAssigneeId?: number | null;
  onSubmit: (data: AssignComplaintFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AssignComplaintModal({
  isOpen,
  onClose,
  employees,
  currentAssigneeId,
  onSubmit,
  isLoading,
}: AssignComplaintModalProps) {
  const [assignedTo, setAssignedTo] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAssignedTo(currentAssigneeId ?? '');
      setReason('');
      setError(null);
    }
  }, [isOpen, currentAssigneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) {
      setError('Select an employee to assign.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ assigned_to: assignedTo, reason: reason || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to assign complaint'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentAssigneeId ? 'Reassign Complaint' : 'Assign Complaint'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assign To *</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.name} {emp.department?.name ? `(${emp.department.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Reassigning to the facilities staff"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Assign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
