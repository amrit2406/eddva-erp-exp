import { Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { cn } from '../../../../utils/cn';
import { formatDateDisplay, toTimeInputValue } from '../../utils/dateTime';
import type { FrontOfficeAppointment } from '../../types/appointmentRecord.types';

interface AppointmentTableProps {
  appointments: FrontOfficeAppointment[];
  className?: string;
}

export default function AppointmentTable({ appointments, className }: AppointmentTableProps) {
  const rows = Array.isArray(appointments) ? appointments : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Host</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Department</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Time</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Purpose</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-slate-500">
                No appointments found.
              </td>
            </tr>
          ) : (
            rows.map((appointment) => (
              <tr key={appointment.appointment_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 sm:px-4">
                  <Link
                    to={`/front-office/appointments/${appointment.appointment_id}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    {appointment.visitor_name}
                  </Link>
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{appointment.phone || '—'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                  {appointment.host_employee?.name || '—'}
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                  {appointment.department?.name || '—'}
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">
                  {formatDateDisplay(appointment.appointment_date)}
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                  {toTimeInputValue(appointment.start_time)} - {toTimeInputValue(appointment.end_time)}
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{appointment.purpose || '—'}</td>
                <td className="py-3 px-2 sm:px-4">
                  <StatusBadge status={appointment.status} variant="appointment" />
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link to={`/front-office/appointments/${appointment.appointment_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/front-office/appointments/${appointment.appointment_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
