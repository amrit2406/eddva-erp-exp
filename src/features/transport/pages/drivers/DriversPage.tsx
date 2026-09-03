import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import DriverTable from '../../components/drivers/DriverTable';
import { getDrivers } from '../../api/drivers.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportDriver } from '../../types/driver.types';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    try {
      setLoading(true);
      const data = await getDrivers();
      setDrivers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load drivers'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="text-slate-600 mt-1">Manage transport drivers, documents, and vehicle assignments</p>
        </div>
        <Link to="/transport/drivers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
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
          <DriverTable drivers={drivers} />
        </Card>
      )}
    </div>
  );
}
