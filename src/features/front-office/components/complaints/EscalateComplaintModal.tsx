import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { EscalateComplaintFormData } from '../../types/complaintRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';

interface EscalateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: FrontOfficeEmployee[];
  onSubmit: (data: EscalateComplaintFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function EscalateComplaintModal({ isOpen, onClose, employees, onSubmit, isLoading }: EscalateComplaintModalProps) {
  const [toEmployeeId, setToEmployeeId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToEmployeeId('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmployeeId) {
      setError('Select an employee to escalate to.');
      return;
    }
    if (!reason.trim()) {
      setError('Enter a reason for escalation.');
      return;
    }
    setError(null);
    try {
      await onSubmit({ to_employee_id: toEmployeeId, reason: reason.trim() });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to escalate complaint'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escalate Complaint" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Escalate To *</label>
          <select
            value={toEmployeeId}
            onChange={(e) => setToEmployeeId(e.target.value ? Number(e.target.value) : '')}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., No response from assignee for 48 hours"
            rows={3}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Escalating...' : 'Escalate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
