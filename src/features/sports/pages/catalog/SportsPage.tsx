import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import SportTable from '../../components/catalog/SportTable';
import { getSports, deleteSport } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { Sport } from '../../types/sports.types';

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSports();
  }, []);

  async function loadSports() {
    try {
      setLoading(true);
      const data = await getSports();
      setSports(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load sports catalog'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sport?')) {
      return;
    }
    try {
      await deleteSport(id);
      setSports(sports.filter((s) => s.sport_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete sport'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sports Catalog</h1>
          <p className="text-slate-600 mt-1">Manage the list of sports offered</p>
        </div>
        <Link to="/sports/catalog/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Sport
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
          <SportTable sports={sports} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
