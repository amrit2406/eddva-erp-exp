import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RouteTable from '../../components/routes/RouteTable';
import { getRoutes, deleteRoute } from '../../api/routes.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportRoute } from '../../types/route.types';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      setLoading(true);
      const data = await getRoutes();
      setRoutes(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load routes'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }
    try {
      await deleteRoute(id);
      setRoutes(routes.filter((r) => r.route_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete route'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Routes</h1>
          <p className="text-slate-600 mt-1">Manage transport routes, stops, and vehicle assignments</p>
        </div>
        <Link to="/transport/routes/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
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
          <RouteTable routes={routes} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
