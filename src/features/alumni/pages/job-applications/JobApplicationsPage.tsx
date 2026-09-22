import { useCallback } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getJobApplications } from '../../api/jobApplications.api';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'application_id');
  return id ? `/alumni/job-applications/${id}` : undefined;
};

export default function JobApplicationsPage() {
  const load = useCallback((params: ListParams) => getJobApplications(params), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Applications</h1>
        <p className="text-slate-600 mt-1">Applications submitted across every job posting</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={load} emptyMessage="No job applications found" rowHref={rowHref} />
      </Card>
    </div>
  );
}
