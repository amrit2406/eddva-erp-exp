import { useEffect, useState } from 'react';
import { Briefcase, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import EmploymentForm from './EmploymentForm';
import {
  createEmployment,
  deleteEmployment,
  getEmploymentHistory,
  setCurrentEmployment,
  updateEmployment,
} from '../../api/employment.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { EmploymentEntry, EmploymentFormData } from '../../types/engagement.types';

interface ProfileEmploymentPanelProps {
  alumniId: string;
  canEdit: boolean;
}

type ModalState = { mode: 'create' } | { mode: 'edit'; entry: EmploymentEntry } | null;

const EMPTY: EmploymentFormData = {
  company: '',
  designation: '',
  industry: '',
  location: '',
  start_date: '',
  end_date: '',
  is_current: false,
};

export default function ProfileEmploymentPanel({ alumniId, canEdit }: ProfileEmploymentPanelProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<EmploymentEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    getEmploymentHistory(alumniId)
      .then((result) => {
        // Most recent role first.
        const sorted = [...result.data].sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
        setEntries(sorted);
        setError(null);
      })
      .catch((err) => {
        if (err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load employment history'));
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumniId]);

  const handleSubmit = async (data: EmploymentFormData) => {
    try {
      setSubmitting(true);
      setFormError(null);
      if (modal?.mode === 'edit') {
        await updateEmployment(alumniId, modal.entry.employment_id, data);
        toast.success('Employment updated');
      } else {
        await createEmployment(alumniId, data);
        toast.success('Employment added');
      }
      setModal(null);
      load();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save employment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entry: EmploymentEntry) => {
    if (!window.confirm(`Delete the "${entry.designation}" role at "${entry.company}"?`)) return;
    try {
      await deleteEmployment(alumniId, entry.employment_id);
      toast.success('Employment deleted');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete employment'));
    }
  };

  const handleSetCurrent = async (entry: EmploymentEntry) => {
    try {
      await setCurrentEmployment(alumniId, entry.employment_id);
      toast.success('Marked as current role');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update current role'));
    }
  };

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!entries) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end p-4 border-b border-slate-200">
          <Button variant="primary" size="sm" onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employment
          </Button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No employment history recorded</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.employment_id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">
                    {entry.designation} · {entry.company}
                    {entry.is_current && (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <Star className="h-3 w-3" />
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {[entry.industry, entry.location].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatValue('start_date', entry.start_date)} —{' '}
                    {entry.is_current ? 'Present' : formatValue('end_date', entry.end_date)}
                  </p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!entry.is_current && (
                    <Button variant="ghost" size="sm" title="Set as current" onClick={() => handleSetCurrent(entry)}>
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" title="Edit" onClick={() => setModal({ mode: 'edit', entry })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(entry)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={modal !== null}
        onClose={() => !submitting && setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit Employment' : 'Add Employment'}
      >
        <EmploymentForm
          initialValues={modal?.mode === 'edit' ? { ...modal.entry, end_date: modal.entry.end_date ?? '' } : EMPTY}
          submitting={submitting}
          error={formError}
          submitLabel={modal?.mode === 'edit' ? 'Save' : 'Add'}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </div>
  );
}
