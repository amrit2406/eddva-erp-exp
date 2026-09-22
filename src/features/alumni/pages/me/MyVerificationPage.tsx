import { useEffect, useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import GenericDataView from '../../components/common/GenericDataView';
import { getMyVerification, requestMyVerification } from '../../api/me.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { GenericRecord } from '../../types/profile.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function MyVerificationPage() {
  const { toast } = useToast();
  const [record, setRecord] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getMyVerification()
      .then((data) => {
        setRecord(data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Failed to load verification status')));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await requestMyVerification(note);
      toast.success('Verification request submitted');
      setModalOpen(false);
      setNote('');
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit verification request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Verification</h1>
          <p className="text-slate-600 mt-1">Verification status for the current Alumni session</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Request Verification
        </Button>
      </div>

      <Card className="border-slate-200">
        {loadError ? (
          <div className="p-8 text-center text-red-500">{loadError}</div>
        ) : !record ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <GenericDataView data={record} emptyMessage="No verification record yet" />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => !submitting && setModalOpen(false)} title="Request Verification">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1">
              Note *
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="e.g. Class of 2015, section B, house Blue. Teacher: Mrs. Rao"
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
