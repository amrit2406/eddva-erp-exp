import { Link } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import { useNavigate } from 'react-router-dom';

export default function AppointmentCalendarPage() {
  const navigate = useNavigate();

  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/front-office/appointments/${appointmentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <AppointmentCalendar onAppointmentClick={handleAppointmentClick} />
        </div>
      </Card>
    </div>
  );
}
