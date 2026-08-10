import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentTable from '../../components/appointments/AppointmentTable';
import AppointmentFilters from '../../components/appointments/AppointmentFilters';

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <Card className="border-slate-200">
        <div className="p-6">
          <AppointmentFilters />
          <div className="mt-4">
            <AppointmentTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
