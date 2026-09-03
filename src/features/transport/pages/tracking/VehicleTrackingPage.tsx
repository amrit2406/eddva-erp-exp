import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Satellite, AlertTriangle, Wrench, Navigation, Gauge } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AlertsTable from '../../components/tracking/AlertsTable';
import AddGpsDeviceModal from '../../components/tracking/AddGpsDeviceModal';
import RaiseAlertModal from '../../components/tracking/RaiseAlertModal';
import AddMaintenanceModal from '../../components/tracking/AddMaintenanceModal';
import {
  getGpsDevices,
  createGpsDevice,
  getCurrentLocation,
  getLocationHistory,
  createAlert,
  getAlerts,
  resolveAlert,
  createMaintenance,
  getMaintenance,
} from '../../api/tracking.api';
import { getVehicle } from '../../api/vehicles.api';
import { getApiErrorMessage } from '../../utils/errors';
import type {
  TransportGpsDevice,
  TransportGpsDeviceFormData,
  TransportVehicleLocation,
  TransportAlert,
  TransportAlertFormData,
  TransportMaintenanceRecord,
  TransportMaintenanceFormData,
} from '../../types/tracking.types';
import type { TransportVehicle } from '../../types/vehicle.types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function VehicleTrackingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [vehicle, setVehicle] = useState<TransportVehicle | null>(null);
  const [currentLocation, setCurrentLocation] = useState<TransportVehicleLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<TransportVehicleLocation[]>([]);
  const [gpsDevices, setGpsDevices] = useState<TransportGpsDevice[]>([]);
  const [alerts, setAlerts] = useState<TransportAlert[]>([]);
  const [maintenance, setMaintenance] = useState<TransportMaintenanceRecord[]>([]);
  const [fromDate, setFromDate] = useState(daysAgo(7));
  const [toDate, setToDate] = useState(daysAgo(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isSubmittingDevice, setIsSubmittingDevice] = useState(false);
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  async function load() {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const [vehicleData, gpsData, allAlerts, maintenanceData] = await Promise.all([
        getVehicle(vehicleId),
        getGpsDevices(vehicleId),
        getAlerts(),
        getMaintenance(vehicleId),
      ]);
      setVehicle(vehicleData);
      setGpsDevices(gpsData);
      setAlerts(allAlerts.filter((a) => a.vehicle_id === Number(vehicleId)));
      setMaintenance(maintenanceData);

      try {
        const location = await getCurrentLocation(vehicleId);
        setCurrentLocation(location);
      } catch {
        setCurrentLocation(null);
      }
      await loadHistory(fromDate, toDate);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load vehicle tracking data'));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(from: string, to: string) {
    if (!vehicleId) return;
    try {
      const history = await getLocationHistory(vehicleId, from, to);
      setLocationHistory(history);
    } catch {
      setLocationHistory([]);
    }
  }

  async function handleDeviceSubmit(data: TransportGpsDeviceFormData) {
    if (!vehicleId) return;
    setIsSubmittingDevice(true);
    try {
      await createGpsDevice(vehicleId, data);
      const gpsData = await getGpsDevices(vehicleId);
      setGpsDevices(gpsData);
      setIsDeviceModalOpen(false);
    } finally {
      setIsSubmittingDevice(false);
    }
  }

  async function handleAlertSubmit(data: TransportAlertFormData) {
    if (!vehicleId) return;
    setIsSubmittingAlert(true);
    try {
      await createAlert(vehicleId, data);
      const allAlerts = await getAlerts();
      setAlerts(allAlerts.filter((a) => a.vehicle_id === Number(vehicleId)));
      setIsAlertModalOpen(false);
    } finally {
      setIsSubmittingAlert(false);
    }
  }

  async function handleResolveAlert(id: number) {
    if (!window.confirm('Mark this alert as resolved?')) return;
    try {
      await resolveAlert(id);
      setAlerts(alerts.map((a) => (a.alert_id === id ? { ...a, resolved: true } : a)));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      alert(getApiErrorMessage(err, 'Failed to resolve alert'));
    }
  }

  async function handleMaintenanceSubmit(data: TransportMaintenanceFormData) {
    if (!vehicleId) return;
    setIsSubmittingMaintenance(true);
    try {
      await createMaintenance(vehicleId, data);
      const maintenanceData = await getMaintenance(vehicleId);
      setMaintenance(maintenanceData);
      setIsMaintenanceModalOpen(false);
    } finally {
      setIsSubmittingMaintenance(false);
    }
  }

  const handleHistoryFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(fromDate, toDate);
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!vehicle) {
    return <div className="text-center py-8 text-slate-500">Vehicle not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/transport/vehicles" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicles
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{vehicle.registration_number}</h1>
          <p className="text-slate-600 mt-1">{vehicle.model} — Live tracking &amp; vehicle history</p>
        </div>
        <Button variant="secondary" onClick={() => setIsAlertModalOpen(true)}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Raise Alert
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            Current Location
          </h3>
          {currentLocation ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">Latitude</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{currentLocation.latitude}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Longitude</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{currentLocation.longitude}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" /> Speed
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {currentLocation.speed_kmph != null ? `${currentLocation.speed_kmph} km/h` : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5" /> Recorded At
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {new Date(currentLocation.recorded_at).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No current location data available.</p>
          )}
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              Location History
            </h3>
            <form onSubmit={handleHistoryFilter} className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
              <Button type="submit" variant="secondary" size="sm">
                Filter
              </Button>
            </form>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Recorded At</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Latitude</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Longitude</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Speed</th>
                </tr>
              </thead>
              <tbody>
                {locationHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No location history in this date range.
                    </td>
                  </tr>
                ) : (
                  locationHistory.map((log) => (
                    <tr key={log.log_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(log.recorded_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-900">{log.latitude}</td>
                      <td className="py-2 px-4 text-sm text-slate-900">{log.longitude}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {log.speed_kmph != null ? `${log.speed_kmph} km/h` : '—'}
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
              <Satellite className="h-5 w-5 text-blue-600" />
              GPS Devices
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsDeviceModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Device Serial</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">SIM Number</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Installed Date</th>
                </tr>
              </thead>
              <tbody>
                {gpsDevices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No GPS devices installed on this vehicle yet.
                    </td>
                  </tr>
                ) : (
                  gpsDevices.map((device) => (
                    <tr key={device.device_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900 font-mono">{device.device_serial}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{device.sim_number || '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {device.installed_date ? new Date(device.installed_date).toLocaleDateString() : '—'}
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
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Alerts
          </h3>
          <AlertsTable alerts={alerts} showVehicle={false} onResolve={handleResolveAlert} />
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Maintenance
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsMaintenanceModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Service Date</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Service Type</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Cost</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Next Due (km)</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Next Due Date</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No maintenance records for this vehicle yet.
                    </td>
                  </tr>
                ) : (
                  maintenance.map((record) => (
                    <tr key={record.maintenance_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(record.service_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-900 capitalize">
                        {record.service_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {record.cost != null ? `₹${record.cost}` : '—'}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">{record.next_service_due_km ?? '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {record.next_service_due_date
                          ? new Date(record.next_service_due_date).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AddGpsDeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onSubmit={handleDeviceSubmit}
        isLoading={isSubmittingDevice}
      />

      <RaiseAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onSubmit={handleAlertSubmit}
        isLoading={isSubmittingAlert}
      />

      <AddMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        isLoading={isSubmittingMaintenance}
      />
    </div>
  );
}
