import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import { getAppointments } from '../../api/appointments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeAppointment } from '../../types/appointmentRecord.types';

function toDateParam(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AppointmentCalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<FrontOfficeAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const from = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const result = await getAppointments({ from: toDateParam(from), to: toDateParam(to), limit: 500 });
      setAppointments(result.data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }

  const handleAppointmentClick = (appointmentId: number) => {
    navigate(`/front-office/appointments/${appointmentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link to="/front-office/appointments">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointment Calendar</h1>
            <p className="text-slate-600 mt-1">View appointments in calendar format</p>
          </div>
        </div>
        <Link to="/front-office/appointments">
          <Button variant="secondary">
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              currentDate={currentDate}
              onMonthChange={setCurrentDate}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
