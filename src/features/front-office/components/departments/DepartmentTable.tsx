import { Link } from 'react-router-dom';
import { Edit, Building2, Users, Calendar } from 'lucide-react';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';
import { cn } from '../../../../utils/cn';

interface DepartmentTableProps {
  departments: FrontOfficeDepartment[];
  className?: string;
}

export default function DepartmentTable({ departments, className }: DepartmentTableProps) {
  const departmentsArray = Array.isArray(departments) ? departments : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Employees</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Appointments</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departmentsArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No departments found. Add your first department.
              </td>
            </tr>
          ) : (
            departmentsArray.map((dept) => (
              <tr key={dept.department_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{dept.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      dept.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {dept.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {dept._count?.employees ?? 0}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {dept._count?.appointments ?? 0}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/front-office/departments/${dept.department_id}/edit`}>
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
