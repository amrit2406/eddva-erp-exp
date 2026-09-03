import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, MapPin, Bus, Clock, User } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AddStopModal from '../../components/routes/AddStopModal';
import AssignVehicleModal from '../../components/routes/AssignVehicleModal';
import { getRoute, getRouteStops, createRouteStop, getRouteAssignments, assignVehicleToRoute } from '../../api/routes.api';
import { getVehicles } from '../../api/vehicles.api';
import { getDrivers } from '../../api/drivers.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type {
  TransportRoute,
  TransportRouteStop,
  TransportRouteStopFormData,
  TransportRouteAssignment,
  TransportAssignVehicleFormData,
  TransportDriver,
} from '../../types/route.types';
import type { TransportVehicle } from '../../types/vehicle.types';

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<TransportRoute | null>(null);
  const [stops, setStops] = useState<TransportRouteStop[]>([]);
  const [assignments, setAssignments] = useState<TransportRouteAssignment[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmittingStop, setIsSubmittingStop] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [routeData, stopsData, assignmentsData, vehicleData, driverData] = await Promise.all([
        getRoute(id),
        getRouteStops(id),
        getRouteAssignments(id),
        getVehicles(),
        getDrivers(),
      ]);
      setRoute(routeData);
      setStops(stopsData);
      setAssignments(assignmentsData);
      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load route'));
    } finally {
      setLoading(false);
    }
  }

  async function handleStopSubmit(data: TransportRouteStopFormData) {
    if (!id) return;
    setIsSubmittingStop(true);
    try {
      await createRouteStop(id, data);
      const stopsData = await getRouteStops(id);
      setStops(stopsData);
      setIsStopModalOpen(false);
    } finally {
      setIsSubmittingStop(false);
    }
  }

  async function handleAssignSubmit(data: TransportAssignVehicleFormData) {
    if (!id) return;
    setIsSubmittingAssign(true);
    try {
      await assignVehicleToRoute(id, data.vehicle_id, {
        driver_id: data.driver_id,
        effective_from: data.effective_from,
      });
      const assignmentsData = await getRouteAssignments(id);
      setAssignments(assignmentsData);
      setIsAssignModalOpen(false);
    } finally {
      setIsSubmittingAssign(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!route) {
    return <div className="text-center py-8 text-slate-500">Route not found.</div>;
  }

  const sortedStops = [...stops].sort((a, b) => a.sequence_no - b.sequence_no);
  const nextSequenceNo = sortedStops.length > 0 ? sortedStops[sortedStops.length - 1].sequence_no + 1 : 1;

  return (
    <div className="space-y-6">
      <Link to="/transport/routes" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Routes
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{route.name}</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {route.start_location} <ArrowLeft className="h-3 w-3 rotate-180" /> {route.end_location}
          </p>
        </div>
        <Link to={`/transport/routes/${route.route_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Route
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Stops
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsStopModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stop
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Seq.</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Stop Name</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Pickup</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Drop</th>
                </tr>
              </thead>
              <tbody>
                {sortedStops.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No stops added to this route yet.
                    </td>
                  </tr>
                ) : (
                  sortedStops.map((stop) => (
                    <tr key={stop.stop_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">{stop.sequence_no}</td>
                      <td className="py-2 px-4 text-sm text-slate-900">{stop.stop_name}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {stop.pickup_time ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {stop.pickup_time}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {stop.drop_time ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {stop.drop_time}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              Vehicle Assignments
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Vehicle
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Vehicle</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Driver</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Effective From</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Effective To</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No vehicles assigned to this route yet.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.assignment_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Bus className="h-3.5 w-3.5 text-slate-400" />
                          {assignment.vehicle?.registration_number ?? `#${assignment.vehicle_id}`}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {assignment.driver?.name ?? `#${assignment.driver_id}`}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(assignment.effective_from).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {assignment.effective_to ? new Date(assignment.effective_to).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                            assignment.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {assignment.status}
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

      <AddStopModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onSubmit={handleStopSubmit}
        nextSequenceNo={nextSequenceNo}
        isLoading={isSubmittingStop}
      />

      <AssignVehicleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        onSubmit={handleAssignSubmit}
        isLoading={isSubmittingAssign}
      />
    </div>
  );
}
