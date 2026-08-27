import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VenueTable from '../../components/venues/VenueTable';
import { getVenues, deleteVenue } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { Venue } from '../../types/sports.types';

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    try {
      setLoading(true);
      const data = await getVenues();
      setVenues(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load venues'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) {
      return;
    }
    try {
      await deleteVenue(id);
      setVenues(venues.filter((v) => v.venue_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete venue'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Venues</h1>
          <p className="text-slate-600 mt-1">Manage grounds, courts, pools, and halls</p>
        </div>
        <Link to="/sports/venues/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
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
          <VenueTable venues={venues} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
