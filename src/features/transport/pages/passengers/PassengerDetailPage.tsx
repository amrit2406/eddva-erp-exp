import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, User, Phone, Route as RouteIcon, MapPin } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AllocateRouteModal from '../../components/passengers/AllocateRouteModal';
import { getPassenger, getPassengerAllocations, allocateRouteToPassenger } from '../../api/passengers.api';
import { getRoutes } from '../../api/routes.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { TransportPassenger, TransportPassengerAllocation, TransportAllocateRouteFormData } from '../../types/passenger.types';
import type { TransportRoute } from '../../types/route.types';

export default function PassengerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [passenger, setPassenger] = useState<TransportPassenger | null>(null);
  const [allocations, setAllocations] = useState<TransportPassengerAllocation[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [passengerData, allocationData, routeData] = await Promise.all([
        getPassenger(id),
        getPassengerAllocations(id),
        getRoutes(),
      ]);
      setPassenger(passengerData);
      setAllocations(allocationData);
      setRoutes(routeData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load passenger'));
    } finally {
      setLoading(false);
    }
  }

  async function handleAllocateSubmit(data: TransportAllocateRouteFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await allocateRouteToPassenger(id, data.route_id, {
        effective_from: data.effective_from,
        pickup_stop_id: data.pickup_stop_id,
        drop_stop_id: data.drop_stop_id,
      });
      const allocationData = await getPassengerAllocations(id);
      setAllocations(allocationData);
      setIsAllocateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!passenger) {
    return <div className="text-center py-8 text-slate-500">Passenger not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/transport/passengers" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Passengers
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <User className="h-6 w-6 text-slate-400" />
            {passenger.name}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                passenger.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {passenger.status}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 flex items-center gap-3">
            <span className="capitalize">{passenger.type}</span>
            {passenger.external_ref_id && <span className="font-mono text-sm">{passenger.external_ref_id}</span>}
            {passenger.phone && (
              <span className="inline-flex items-center gap-1 text-sm">
                <Phone className="h-3.5 w-3.5" /> {passenger.phone}
              </span>
            )}
          </p>
        </div>
        <Link to={`/transport/passengers/${passenger.passenger_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Passenger
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-blue-600" />
              Route Allocations
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsAllocateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Allocate Route
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Route</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Pickup Stop</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Drop Stop</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Effective From</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No routes allocated to this passenger yet.
                    </td>
                  </tr>
                ) : (
                  allocations.map((allocation) => (
                    <tr key={allocation.allocation_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">
                        {allocation.route?.name ?? `#${allocation.route_id}`}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {allocation.pickup_stop ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {allocation.pickup_stop.stop_name}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {allocation.drop_stop ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {allocation.drop_stop.stop_name}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(allocation.effective_from).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                            allocation.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {allocation.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AllocateRouteModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        routes={routes}
        onSubmit={handleAllocateSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
