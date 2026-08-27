import { useEffect, useState } from 'react';
import { Plus, Award } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { useToast } from '../../../../hooks/useToast';
import { getSports, getParticipants, getSportRecords, getParticipantRecords, createRecord } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import RecordTable from '../../components/records/RecordTable';
import LogRecordModal from '../../components/records/LogRecordModal';
import type { Sport, SportsParticipant, SportsRecord, SportsRecordFormData } from '../../types/sports.types';

type ScopeMode = 'sport' | 'participant';

export default function RecordsPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<ScopeMode>('sport');
  const [sports, setSports] = useState<Sport[]>([]);
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [sportId, setSportId] = useState<number | ''>('');
  const [participantId, setParticipantId] = useState<number | ''>('');
  const [records, setRecords] = useState<SportsRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSports().then(setSports).catch(() => setSports([]));
    getParticipants().then(setParticipants).catch(() => setParticipants([]));
  }, []);

  useEffect(() => {
    setRecords([]);
    if (mode === 'sport' && sportId) loadBySport(sportId);
    if (mode === 'participant' && participantId) loadByParticipant(participantId);
  }, [mode, sportId, participantId]);

  async function loadBySport(id: number) {
    try {
      setLoading(true);
      const data = await getSportRecords(id);
      setRecords(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load records'));
    } finally {
      setLoading(false);
    }
  }

  async function loadByParticipant(id: number) {
    try {
      setLoading(true);
      const data = await getParticipantRecords(id);
      setRecords(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load records'));
    } finally {
      setLoading(false);
    }
  }

  async function handleLogRecord(data: SportsRecordFormData) {
    setIsSubmitting(true);
    try {
      await createRecord(data);
      toast.success('Record logged.');
      setIsModalOpen(false);
      if (mode === 'sport' && sportId) loadBySport(sportId);
      if (mode === 'participant' && participantId) loadByParticipant(participantId);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Records</h1>
          <p className="text-slate-600 mt-1">Personal bests, milestones, and school records</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Record
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-1 text-sm bg-slate-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setMode('sport')}
                className={`px-3 py-1.5 rounded-md ${mode === 'sport' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                By Sport
              </button>
              <button
                onClick={() => setMode('participant')}
                className={`px-3 py-1.5 rounded-md ${mode === 'participant' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                By Participant
              </button>
            </div>

            {mode === 'sport' ? (
              <Select
                value={sportId}
                onChange={(e) => setSportId(e.target.value ? Number(e.target.value) : '')}
                options={sports.map((s) => ({ value: String(s.sport_id), label: s.name }))}
                placeholder="Select a sport"
                className="w-64"
              />
            ) : (
              <Select
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value ? Number(e.target.value) : '')}
                options={participants.map((p) => ({ value: String(p.participant_id), label: p.name }))}
                placeholder="Select a participant"
                className="w-64"
              />
            )}
          </div>

          {!sportId && !participantId ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-slate-300" />
              Select a sport or participant to view records.
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <RecordTable records={records} />
          )}
        </div>
      </Card>

      <LogRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLogRecord}
        isLoading={isSubmitting}
        defaultSportId={mode === 'sport' && sportId ? sportId : undefined}
      />
    </div>
  );
}
