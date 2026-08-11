import { Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import { mockAppointments } from '../../mock/appointments.mock';
import StatusBadge from '../common/StatusBadge';
import { cn } from '../../../../utils/cn';

interface AppointmentTableProps {
  className?: string;
}

export default function AppointmentTable({ className }: AppointmentTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Appointment #</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Host</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Time</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Purpose</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockAppointments.map((appointment) => (
            <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900 font-medium">{appointment.appointmentNumber}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{appointment.visitorName}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{appointment.visitorPhone}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{appointment.hostEmployeeName}</td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                {appointment.startTime} - {appointment.endTime}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{appointment.purpose}</td>
              <td className="py-3 px-2 sm:px-4">
                <StatusBadge status={appointment.status} variant="appointment" />
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to={`/front-office/appointments/${appointment.id}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link to={`/front-office/appointments/${appointment.id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
