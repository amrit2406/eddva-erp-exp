import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import GatePassSelect from './GatePassSelect';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';

interface LinkGatePassModalProps {
  // The resident the incident is about. Without it, the gate pass id is typed.
  residentId?: string;
  onClose: () => void;
  // Should throw when the request fails so the modal can show the error.
  onSubmit: (gatePassId: number) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

function LinkForm({ residentId, onClose, onSubmit }: LinkGatePassModalProps) {
  const [gatePassId, setGatePassId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(Number(gatePassId));
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to link gate pass'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">Connect this incident to the gate pass it relates to.</p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label htmlFor="link_gate_pass" className="block text-sm font-medium text-slate-700 mb-1">
          Gate Pass *
        </label>
        {residentId ? (
          <GatePassSelect
            id="link_gate_pass"
            residentId={residentId}
            value={gatePassId}
            onChange={setGatePassId}
            placeholder="Select a gate pass"
            required
          />
        ) : (
          <input
            id="link_gate_pass"
            type="number"
            min={1}
            value={gatePassId}
            onChange={(e) => setGatePassId(e.target.value)}
            placeholder="Gate pass ID"
            className={inputClass}
            required
          />
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || !gatePassId}>
          {submitting ? 'Linking...' : 'Link Gate Pass'}
        </Button>
      </div>
    </form>
  );
}

export default function LinkGatePassModal(props: LinkGatePassModalProps) {
  return (
    <Modal isOpen onClose={props.onClose} title="Link Gate Pass">
      <LinkForm {...props} />
    </Modal>
  );
}
