import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ParticipantTable from '../../components/participants/ParticipantTable';
import { getParticipants, deleteParticipant } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsParticipant } from '../../types/sports.types';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<SportsParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParticipants();
  }, []);

  async function loadParticipants() {
    try {
      setLoading(true);
      const data = await getParticipants();
      setParticipants(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load participants'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }
    try {
      await deleteParticipant(id);
      setParticipants(participants.filter((p) => p.participant_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete participant'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Participants</h1>
          <p className="text-slate-600 mt-1">Manage student sports participants</p>
        </div>
        <Link to="/sports/participants/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <ParticipantTable participants={participants} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
