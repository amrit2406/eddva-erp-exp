import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { cn } from '../../../../utils/cn';
import { toDateInputValue, toTimeInputValue } from '../../utils/dateTime';
import type { FrontOfficeAppointment } from '../../types/appointmentRecord.types';

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface AppointmentCalendarProps {
  appointments: FrontOfficeAppointment[];
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
  onAppointmentClick?: (appointmentId: number) => void;
}

export default function AppointmentCalendar({
  appointments,
  currentDate,
  onMonthChange,
  className,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAppointmentsForDate = (date: Date) => {
    const key = toLocalDateKey(date);
    return appointments.filter((app) => toDateInputValue(app.appointment_date) === key);
  };

  const goToPreviousMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 min-h-[100px] bg-slate-50 border border-slate-200" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            'p-2 min-h-[100px] border border-slate-200 hover:bg-slate-50',
            isToday && 'bg-blue-50'
          )}
        >
          <div className={cn('text-sm font-medium mb-1', isToday && 'text-blue-600')}>
            {day}
          </div>
          <div className="space-y-1">
            {dayAppointments.slice(0, 2).map((app) => (
              <div
                key={app.appointment_id}
                onClick={() => onAppointmentClick?.(app.appointment_id)}
                className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate hover:bg-blue-200 cursor-pointer"
              >
                {toTimeInputValue(app.start_time)} {app.visitor_name}
              </div>
            ))}
            {dayAppointments.length > 2 && (
              <div className="text-xs text-slate-500">
                +{dayAppointments.length - 2} more
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
