import { Link } from 'react-router-dom';
import { Edit, User, Mail, Phone, Building2 } from 'lucide-react';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import { cn } from '../../../../utils/cn';

interface EmployeeTableProps {
  employees: FrontOfficeEmployee[];
  className?: string;
}

export default function EmployeeTable({ employees, className }: EmployeeTableProps) {
  const employeesArray = Array.isArray(employees) ? employees : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Designation</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Contact</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employeesArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No employees found.
              </td>
            </tr>
          ) : (
            employeesArray.map((emp) => (
              <tr key={emp.employee_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/front-office/employees/${emp.employee_id}`} className="flex items-center gap-2 hover:underline">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="font-medium text-slate-900">{emp.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {emp.department?.name ?? `#${emp.department_id}`}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{emp.designation || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="space-y-0.5">
                    {emp.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {emp.email}
                      </div>
                    )}
                    {emp.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {emp.phone}
                      </div>
                    )}
                    {!emp.email && !emp.phone && '—'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {emp.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/front-office/employees/${emp.employee_id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
