import { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card';
import AlertsTable from '../../components/tracking/AlertsTable';
import { getAlerts, resolveAlert } from '../../api/tracking.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportAlert } from '../../types/tracking.types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TransportAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load alerts'));
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (id: number) => {
    if (!window.confirm('Mark this alert as resolved?')) {
      return;
    }
    try {
      await resolveAlert(id);
      setAlerts(alerts.map((a) => (a.alert_id === id ? { ...a, resolved: true } : a)));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to resolve alert'));
    }
  };

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tracking Alerts</h1>
        <p className="text-slate-600 mt-1">
          {unresolvedCount > 0
            ? `${unresolvedCount} unresolved alert${unresolvedCount === 1 ? '' : 's'} across the fleet`
            : 'All alerts resolved'}
        </p>
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
          <div className="p-4">
            <AlertsTable alerts={alerts} onResolve={handleResolve} />
          </div>
        </Card>
      )}
    </div>
  );
}
