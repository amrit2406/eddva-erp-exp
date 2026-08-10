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
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Appointment #</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Host</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Time</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Purpose</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockAppointments.map((appointment) => (
            <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-sm text-slate-900 font-medium">{appointment.appointmentNumber}</td>
              <td className="py-3 px-4 text-sm text-slate-900">{appointment.visitorName}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{appointment.visitorPhone}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{appointment.hostEmployeeName}</td>
              <td className="py-3 px-4 text-sm text-slate-600">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">
                {appointment.startTime} - {appointment.endTime}
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">{appointment.purpose}</td>
              <td className="py-3 px-4">
                <StatusBadge status={appointment.status} variant="appointment" />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
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
