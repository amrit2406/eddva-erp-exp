import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search as SearchIcon } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import { getEmployees } from '../../api/employees.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import EmployeeTable from '../../components/employees/EmployeeTable';
import type { FrontOfficeEmployee, EmployeePagination } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [pagination, setPagination] = useState<EmployeePagination | null>(null);
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, departmentId]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, departmentId, page]);

  async function load() {
    try {
      setLoading(true);
      const result = await getEmployees({
        search: search || undefined,
        department_id: departmentId || undefined,
        page,
        limit: 25,
      });
      setEmployees(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600 mt-1">Manage front office employees and hosts</p>
        </div>
        <Link to="/front-office/employees/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, designation, or email..."
              className="pl-9"
            />
          </div>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent sm:w-56"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <EmployeeTable employees={employees} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} employees)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
