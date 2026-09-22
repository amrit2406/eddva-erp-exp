import { useCallback } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getMentorshipMatches } from '../../api/mentorshipMatches.api';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'match_id');
  return id ? `/alumni/mentorship-matches/${id}` : undefined;
};

export default function MentorshipMatchesPage() {
  const load = useCallback((params: ListParams) => getMentorshipMatches(params), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mentorship Matches</h1>
        <p className="text-slate-600 mt-1">Mentor-mentee matches across every program</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={load} emptyMessage="No mentorship matches found" rowHref={rowHref} />
      </Card>
    </div>
  );
}
