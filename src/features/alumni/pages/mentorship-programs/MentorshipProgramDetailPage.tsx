import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Pencil, Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import CreateMatchModal from '../../components/mentorship-programs/CreateMatchModal';
import {
  closeMentorshipProgram,
  createProgramMatch,
  getMentorshipProgram,
  getProgramMatches,
  getProgramMentors,
} from '../../api/mentorshipPrograms.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';
import type { MatchCreatePayload, MentorshipProgram } from '../../types/mentorship.types';

type Tab = 'mentors' | 'matches';

const TABS: { key: Tab; label: string }[] = [
  { key: 'mentors', label: 'Mentors' },
  { key: 'matches', label: 'Matches' },
];

const matchHref = (row: GenericRecord) => {
  const id = recordId(row, 'match_id');
  return id ? `/alumni/mentorship-matches/${id}` : undefined;
};

export default function MentorshipProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('mentorship_programs');
  const [program, setProgram] = useState<MentorshipProgram | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('mentors');
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchesKey, setMatchesKey] = useState(0);

  const reload = async () => {
    if (!id) return;
    setProgram(await getMentorshipProgram(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMentorshipProgram(id)
      .then((data) => {
        if (!cancelled) setProgram(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load program'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadMentors = useCallback((params: ListParams) => getProgramMentors(id!, params), [id]);
  const loadMatches = useCallback((params: ListParams) => getProgramMatches(id!, params), [id]);

  const handleClose = async () => {
    if (!id || !window.confirm('Close this mentorship program?')) return;
    try {
      await closeMentorshipProgram(id);
      toast.success('Program closed');
      await reload();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to close program'));
    }
  };

  const handleCreateMatch = async (data: MatchCreatePayload) => {
    if (!id) return;
    await createProgramMatch(id, data);
    toast.success('Match created');
    setMatchModalOpen(false);
    setMatchesKey((key) => key + 1);
    setTab('matches');
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!program) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const isClosed = program.status?.toLowerCase() === 'closed';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/alumni/mentorship-programs"
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to programs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
            <p className="text-slate-600 mt-1">
              {formatValue('start_date', program.start_date)} – {formatValue('end_date', program.end_date)}
              {program.status ? ` · ${program.status}` : ''}
            </p>
            {program.description && <p className="text-slate-600 mt-1 max-w-2xl">{program.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {!isClosed && can('create') && (
              <Button variant="primary" onClick={() => setMatchModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            )}
            {!isClosed && can('update') && (
              <Link to={`/alumni/mentorship-programs/${program.program_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {!isClosed && (can('update') || can('close')) && (
              <Button variant="ghost" onClick={handleClose}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Close Program
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'mentors' && <RecordPanel key="mentors" load={loadMentors} emptyMessage="No mentors in this program yet" />}
        {tab === 'matches' && (
          <RecordPanel key={`matches-${matchesKey}`} load={loadMatches} emptyMessage="No matches yet" rowHref={matchHref} />
        )}
      </Card>

      {id && (
        <CreateMatchModal
          isOpen={matchModalOpen}
          programId={id}
          onClose={() => setMatchModalOpen(false)}
          onSubmit={handleCreateMatch}
        />
      )}
    </div>
  );
}
