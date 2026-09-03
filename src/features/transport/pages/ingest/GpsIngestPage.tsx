import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Satellite, CheckCircle } from 'lucide-react';
import { ingestVehicleLocation } from '../../api/ingest.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportVehicleLocation } from '../../types/tracking.types';

export default function GpsIngestPage() {
  const { vehicleId: vehicleIdParam } = useParams<{ vehicleId?: string }>();
  const [vehicleId, setVehicleId] = useState(vehicleIdParam ?? '');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [speedKmph, setSpeedKmph] = useState('');
  const [heading, setHeading] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLog, setLastLog] = useState<TransportVehicleLocation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim() || !latitude || !longitude) {
      setError('Vehicle ID, latitude, and longitude are required.');
      return;
    }
    setError(null);
    setLastLog(null);
    try {
      setSubmitting(true);
      const log = await ingestVehicleLocation(vehicleId.trim(), {
        latitude: Number(latitude),
        longitude: Number(longitude),
        speed_kmph: speedKmph ? Number(speedKmph) : undefined,
        heading: heading ? Number(heading) : undefined,
      });
      setLastLog(log);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit location ping'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Satellite className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GPS Location Ping</h1>
          <p className="text-slate-600 text-sm">
            Public device-ingestion endpoint. Submits a location update directly — no login required.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {lastLog && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Ping recorded for vehicle #{lastLog.vehicle_id} at {new Date(lastLog.recorded_at).toLocaleString()}
              {' '}(log #{lastLog.log_id}).
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-slate-700 mb-1">
              Vehicle ID *
            </label>
            <input
              type="text"
              id="vehicleId"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="0.0001"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="28.7041"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="0.0001"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="77.1025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-slate-700 mb-1">
                Speed (km/h)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                id="speed"
                value={speedKmph}
                onChange={(e) => setSpeedKmph(e.target.value)}
                placeholder="45.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="heading" className="block text-sm font-medium text-slate-700 mb-1">
                Heading (°)
              </label>
              <input
                type="number"
                min={0}
                max={359}
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="90"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-lg font-semibold py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            {submitting ? 'Sending...' : 'Send Ping'}
          </button>
        </form>
      </div>
    </div>
  );
}
