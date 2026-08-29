import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { getVisitors } from '../../api/visitors.api';
import { getEmployees } from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { ID_PROOF_TYPES } from '../../constants/visitor.constants';
import type { CheckInFormData } from '../../types/visitorLog.types';
import type { FrontOfficeVisitor } from '../../types/visitorRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import { cn } from '../../../../utils/cn';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInFormData) => Promise<void>;
  isLoading?: boolean;
}

type Mode = 'existing' | 'appointment' | 'walkin';

const EMPTY_FORM: CheckInFormData = {
  visitor_id: undefined,
  full_name: '',
  phone: '',
  email: '',
  id_proof_type: '',
  id_proof_number: '',
  photo_url: '',
  organization: '',
  appointment_id: undefined,
  host_employee_id: undefined,
  purpose: '',
  badge_number: '',
};

export default function CheckInModal({ isOpen, onClose, onSubmit, isLoading }: CheckInModalProps) {
  const [mode, setMode] = useState<Mode>('existing');
  const [formData, setFormData] = useState<CheckInFormData>(EMPTY_FORM);
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [visitorQuery, setVisitorQuery] = useState('');
  const [visitorResults, setVisitorResults] = useState<FrontOfficeVisitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<FrontOfficeVisitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
      setMode('existing');
      setFormData(EMPTY_FORM);
      setSelectedVisitor(null);
      setVisitorQuery('');
      setVisitorResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!visitorQuery.trim()) {
      setVisitorResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      getVisitors({ search: visitorQuery.trim() })
        .then((r) => setVisitorResults(r.data))
        .catch(() => setVisitorResults([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [visitorQuery]);

  function handleModeChange(next: Mode) {
    setMode(next);
    setFormData(EMPTY_FORM);
    setSelectedVisitor(null);
    setVisitorQuery('');
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'existing' && !formData.visitor_id) {
      setError('Select an existing visitor.');
      return;
    }
    if (mode === 'appointment' && !formData.appointment_id) {
      setError('Enter the appointment ID.');
      return;
    }
    if (mode === 'walkin' && !formData.full_name?.trim()) {
      setError('Enter the visitor\'s full name.');
      return;
    }
    if (mode !== 'appointment' && !formData.host_employee_id) {
      setError('Select a host employee.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to check in visitor'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check In Visitor" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-1 text-sm bg-slate-100 rounded-lg p-1 w-fit">
          {(['existing', 'appointment', 'walkin'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={cn('px-3 py-1.5 rounded-md', mode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
            >
              {m === 'existing' ? 'Existing Visitor' : m === 'appointment' ? 'From Appointment' : 'Walk-in'}
            </button>
          ))}
        </div>

        {mode === 'existing' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Visitor *</label>
            {selectedVisitor ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">{selectedVisitor.full_name}</p>
                  <p className="text-sm text-green-700">{selectedVisitor.phone || selectedVisitor.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVisitor(null);
                    setFormData({ ...formData, visitor_id: undefined });
                  }}
                  className="text-sm text-green-700 hover:text-green-900"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={visitorQuery}
                  onChange={(e) => setVisitorQuery(e.target.value)}
                  placeholder="Search by name, phone, email..."
                />
                {visitorResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {visitorResults.map((v) => (
                      <button
                        key={v.visitor_id}
                        type="button"
                        onClick={() => {
                          setSelectedVisitor(v);
                          setFormData({ ...formData, visitor_id: v.visitor_id });
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                      >
                        <span className="font-medium text-slate-900">{v.full_name}</span>
                        <span className="text-slate-500"> — {v.phone || v.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {mode === 'appointment' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Appointment ID *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.appointment_id ?? ''}
              onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Host, department, and visitor details are populated from the appointment.</p>
          </div>
        )}

        {mode === 'walkin' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g., Rahul Verma"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Type</label>
              <Input
                list="checkin-id-proof-suggestions"
                value={formData.id_proof_type}
                onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                placeholder="e.g., Aadhaar"
              />
              <datalist id="checkin-id-proof-suggestions">
                {ID_PROOF_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.label} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Number</label>
              <Input
                value={formData.id_proof_number}
                onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
              <Input
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          </div>
        )}

        {mode !== 'appointment' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Host Employee *</label>
            <select
              value={formData.host_employee_id ?? ''}
              onChange={(e) => setFormData({ ...formData, host_employee_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select host</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.name} {e.department?.name ? `(${e.department.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
            <Input
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Parent-teacher meeting"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Badge Number</label>
            <Input
              value={formData.badge_number}
              onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
              placeholder="Auto-assigned if left blank"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Checking In...' : 'Check In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
