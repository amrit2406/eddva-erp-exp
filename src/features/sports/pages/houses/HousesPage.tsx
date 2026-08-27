import { Link } from 'react-router-dom';
import { Plus, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import HouseTable from '../../components/houses/HouseTable';
import { getHouses, deleteHouse } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { House } from '../../types/sports.types';

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHouses();
  }, []);

  async function loadHouses() {
    try {
      setLoading(true);
      const data = await getHouses();
      setHouses(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load houses'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this house?')) {
      return;
    }
    try {
      await deleteHouse(id);
      setHouses(houses.filter((h) => h.house_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete house'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Houses</h1>
          <p className="text-slate-600 mt-1">Manage houses, members, and points</p>
        </div>
        <div className="flex gap-2">
          <Link to="/sports/houses/standings">
            <Button variant="secondary">
              <Trophy className="h-4 w-4 mr-2" />
              Standings
            </Button>
          </Link>
          <Link to="/sports/houses/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add House
            </Button>
          </Link>
        </div>
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
          <HouseTable houses={houses} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
