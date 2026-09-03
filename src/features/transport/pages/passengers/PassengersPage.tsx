import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PassengerTable from '../../components/passengers/PassengerTable';
import { getPassengers } from '../../api/passengers.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportPassenger } from '../../types/passenger.types';

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<TransportPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPassengers();
  }, []);

  async function loadPassengers() {
    try {
      setLoading(true);
      const data = await getPassengers();
      setPassengers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load passengers'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Passengers</h1>
          <p className="text-slate-600 mt-1">Manage transport passengers and their route allocations</p>
        </div>
        <Link to="/transport/passengers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Passenger
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
          <PassengerTable passengers={passengers} />
        </Card>
      )}
    </div>
  );
}
