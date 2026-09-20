import { useState } from 'react';
import { CheckCircle2, Plus, UserX } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ApplicationMultiPicker from '../applications/ApplicationMultiPicker';
import RegistrationStatusBadge from './RegistrationStatusBadge';
import { registerForTest, updateTestRegistration } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { registrationLabel } from '../../utils/tests';
import type { Application, EntranceTest, RegistrationStatus, TestRegistration } from '../../types/admission.types';

interface RegistrationsPanelProps {
  test: EntranceTest;
  registrations: TestRegistration[];
  loading: boolean;
  loadError: string | null;
  canUpdate: boolean;
  onChanged: () => void;
}

export default function RegistrationsPanel({
  test,
  registrations,
  loading,
  loadError,
  canUpdate,
  onChanged,
}: RegistrationsPanelProps) {
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [selected, setSelected] = useState<Application[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const closeForm = () => {
    setRegistering(false);
    setSelected([]);
    setError(null);
  };

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await registerForTest(test.test_id, selected.map((application) => application.application_id));
      toast.success(selected.length === 1 ? 'Application registered' : `${selected.length} applications registered`);
      closeForm();
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to register applications'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (registration: TestRegistration, status: RegistrationStatus) => {
    try {
      setBusyId(registration.registration_id);
      await updateTestRegistration(test.test_id, registration.registration_id, status);
      toast.success(`Marked ${status}`);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to update registration'));
    } finally {
      setBusyId(null);
    }
  };

  const appeared = registrations.filter((registration) => registration.status === 'appeared').length;

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registrations</h2>
            {!loading && !loadError && registrations.length > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">
                {registrations.length} registered · {appeared} appeared
              </p>
            )}
          </div>
          {canUpdate && !registering && (
            <Button variant="secondary" size="sm" onClick={() => setRegistering(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Register Applications
            </Button>
          )}
        </div>

        {registering && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <ApplicationMultiPicker
              sessionId={test.session_id}
              programId={test.program_id}
              excludeIds={registrations.map((registration) => registration.application_id)}
              selected={selected}
              onChange={setSelected}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={closeForm} disabled={submitting}>Cancel</Button>
              <Button variant="primary" disabled={submitting || selected.length === 0} onClick={handleRegister}>
                {submitting ? 'Registering...' : `Register${selected.length ? ` (${selected.length})` : ''}`}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : registrations.length === 0 ? (
          <div className="text-center text-slate-500 py-4">No applications registered yet</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {registrations.map((registration) => {
              const busy = busyId === registration.registration_id;
              return (
                <li key={registration.registration_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{registrationLabel(registration)}</div>
                    <div className="text-xs text-slate-500">Application #{registration.application_id}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RegistrationStatusBadge status={registration.status} />
                    {canUpdate && registration.status !== 'appeared' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Mark appeared"
                        disabled={busy}
                        onClick={() => handleStatus(registration, 'appeared')}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {canUpdate && registration.status !== 'absent' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Mark absent"
                        disabled={busy}
                        onClick={() => handleStatus(registration, 'absent')}
                      >
                        <UserX className="h-4 w-4 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
