import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import RegistrationsPanel from '../../components/tests/RegistrationsPanel';
import ResultsPanel from '../../components/tests/ResultsPanel';
import { getTest } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useTestRegistrations } from '../../hooks/useTestRegistrations';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/format';
import { TESTS_RESOURCE } from '../../utils/tests';
import type { EntranceTest } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

// Split out so the registrations hook only runs once the test (and its id) is loaded.
function TestWorkspace({ test, canUpdate }: { test: EntranceTest; canUpdate: boolean }) {
  const { registrations, loading, error, reload } = useTestRegistrations(test.test_id);
  const { nameOf: programName } = useProgramOptions();
  const { nameOf: sessionName } = useSessionOptions();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-slate-200 self-start">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
          <dl className="space-y-4">
            <Detail label="Session">
              {test.session?.name ?? sessionName(test.session_id) ?? `Session #${test.session_id}`}
            </Detail>
            <Detail label="Program">
              {test.program?.name ?? programName(test.program_id) ?? `Program #${test.program_id}`}
            </Detail>
            <Detail label="Date & Time">{formatDateTime(test.test_date)}</Detail>
            <Detail label="Mode"><span className="capitalize">{test.mode}</span></Detail>
            <Detail label="Venue">{test.venue || '—'}</Detail>
            <Detail label="Maximum Marks">{Number(test.max_marks)}</Detail>
          </dl>
        </div>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <RegistrationsPanel
          test={test}
          registrations={registrations}
          loading={loading}
          loadError={error}
          canUpdate={canUpdate}
          onChanged={reload}
        />
        <ResultsPanel test={test} registrations={registrations} canUpdate={canUpdate} />
      </div>
    </div>
  );
}

export default function TestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(TESTS_RESOURCE);
  const [test, setTest] = useState<EntranceTest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getTest(id)
      .then((data) => {
        if (!cancelled) setTest(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load test'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const backLink = (
    <Link to="/admission/tests" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All tests
    </Link>
  );

  if (loadError || !test || !ready) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card className="border-slate-200">
          {loadError ? (
            <div className="p-8 text-center text-red-500">{loadError}</div>
          ) : (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          )}
        </Card>
      </div>
    );
  }

  const canUpdate = can('update');

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{test.name}</h1>
        {canUpdate && (
          <Link to={`/admission/tests/${test.test_id}/edit`}>
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {!canUpdate && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <TestWorkspace test={test} canUpdate={canUpdate} />
    </div>
  );
}
