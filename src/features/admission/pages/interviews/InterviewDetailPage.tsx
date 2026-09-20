import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EvaluationPanel from '../../components/interviews/EvaluationPanel';
import { InterviewStatusBadge } from '../../components/interviews/InterviewBadges';
import InterviewStatusPanel from '../../components/interviews/InterviewStatusPanel';
import { getInterview } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/format';
import { INTERVIEWS_RESOURCE, interviewApplicantName, isUrl } from '../../utils/interviews';
import type { Interview } from '../../types/admission.types';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 break-words">{children}</dd>
    </div>
  );
}

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(INTERVIEWS_RESOURCE);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getInterview(id)
      .then((data) => {
        if (cancelled) return;
        setInterview(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load interview'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const backLink = (
    <Link to="/admission/interviews" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
      <ArrowLeft className="h-4 w-4" />
      All interviews
    </Link>
  );

  if (loadError || !interview || !ready) {
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
  const reload = () => setReloadKey((key) => key + 1);

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{interviewApplicantName(interview)}</h1>
          <InterviewStatusBadge status={interview.status} />
        </div>
        {canUpdate && (
          <Link to={`/admission/interviews/${interview.interview_id}/edit`}>
            <Button variant="secondary">
              <Pencil className="h-4 w-4 mr-2" />
              Reschedule / Edit
            </Button>
          </Link>
        )}
      </div>

      {!canUpdate && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200 self-start">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
            <dl className="space-y-4">
              <Detail label="Application">
                <Link to={`/admission/applications/${interview.application_id}`} className="text-[#008BE9] hover:underline">
                  Application #{interview.application_id}
                </Link>
              </Detail>
              <Detail label="Date & Time">{formatDateTime(interview.scheduled_datetime)}</Detail>
              <Detail label="Mode"><span className="capitalize">{interview.mode}</span></Detail>
              <Detail label={interview.mode === 'online' ? 'Link / Venue' : 'Venue'}>
                {isUrl(interview.venue_or_link) ? (
                  <a href={interview.venue_or_link!} target="_blank" rel="noopener noreferrer" className="text-[#008BE9] hover:underline">
                    {interview.venue_or_link}
                  </a>
                ) : (
                  interview.venue_or_link || '—'
                )}
              </Detail>
              <Detail label="Panelists">
                {interview.panelist_ids?.length ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {interview.panelist_ids.map((panelist) => (
                      <span key={panelist} className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm">
                        {panelist}
                      </span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </Detail>
            </dl>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <InterviewStatusPanel key={interview.status} interview={interview} canUpdate={canUpdate} onChanged={reload} />
          <EvaluationPanel
            key={`${interview.updated_at}`}
            interview={interview}
            canUpdate={canUpdate}
            onChanged={reload}
          />
        </div>
      </div>
    </div>
  );
}
