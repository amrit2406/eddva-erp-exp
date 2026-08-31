import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentTable from '../../components/appointments/AppointmentTable';
import AppointmentFilters from '../../components/appointments/AppointmentFilters';
import { getAppointments, getTodayAppointments, getUpcomingAppointments } from '../../api/appointments.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeAppointment, AppointmentPagination, FrontOfficeAppointmentStatus } from '../../types/appointmentRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

type Tab = 'all' | 'today' | 'upcoming';

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [appointments, setAppointments] = useState<FrontOfficeAppointment[]>([]);
  const [pagination, setPagination] = useState<AppointmentPagination | null>(null);
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [filters, setFilters] = useState<{
    search: string;
    status: FrontOfficeAppointmentStatus | '';
    department_id: number | '';
    from: string;
    to: string;
  }>({ search: '', status: '', department_id: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, tab]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, tab]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (tab === 'today') {
        const data = await getTodayAppointments();
        setAppointments(data);
        setPagination(null);
      } else if (tab === 'upcoming') {
        const data = await getUpcomingAppointments();
        setAppointments(data);
        setPagination(null);
      } else {
        const result = await getAppointments({
          search: filters.search || undefined,
          status: filters.status || undefined,
          department_id: filters.department_id || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          page,
          limit: 25,
        });
        setAppointments(result.data);
        setPagination(result.pagination);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-600 mt-1">Manage appointments and schedules</p>
        </div>
        <div className="flex gap-3">
          <Link to="/front-office/appointments/calendar">
            <Button variant="secondary">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          <Link to="/front-office/appointments/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-1 text-sm bg-slate-100 rounded-lg p-1 w-fit">
        {(['all', 'today', 'upcoming'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn('px-3 py-1.5 rounded-md capitalize', tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {tab === 'all' && <AppointmentFilters value={filters} onChange={setFilters} departments={departments} />}
          <div className={cn(tab === 'all' && 'mt-4')}>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
                <AppointmentTable appointments={appointments} />
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-sm text-slate-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} appointments)
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Previous
                      </Button>
                      <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
