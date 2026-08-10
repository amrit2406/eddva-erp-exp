import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { mockAppointments } from '../../mock/appointments.mock';
import { cn } from '../../../../utils/cn';
import { useState } from 'react';

interface AppointmentCalendarProps {
  className?: string;
  onAppointmentClick?: (appointmentId: string) => void;
}

export default function AppointmentCalendar({ className, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter((app) => {
      const appDate = new Date(app.appointmentDate);
      return (
        appDate.getDate() === date.getDate() &&
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 min-h-[100px] bg-slate-50 border border-slate-200" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const appointments = getAppointmentsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            'p-2 min-h-[100px] border border-slate-200 hover:bg-slate-50 cursor-pointer',
            isToday && 'bg-blue-50'
          )}
        >
          <div className={cn('text-sm font-medium mb-1', isToday && 'text-blue-600')}>
            {day}
          </div>
          <div className="space-y-1">
            {appointments.slice(0, 2).map((app) => (
              <div
                key={app.id}
                onClick={() => onAppointmentClick?.(app.id)}
                className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate hover:bg-blue-200"
              >
                {app.startTime} {app.visitorName}
              </div>
            ))}
            {appointments.length > 2 && (
              <div className="text-xs text-slate-500">
                +{appointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-slate-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="secondary" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-slate-700 border border-slate-200">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}
