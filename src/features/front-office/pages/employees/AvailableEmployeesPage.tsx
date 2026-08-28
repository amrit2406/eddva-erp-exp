import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserCheck, Building2, Mail, Phone } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getAvailableEmployees } from '../../api/employees.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

const today = () => new Date().toISOString().slice(0, 10);

export default function AvailableEmployeesPage() {
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [results, setResults] = useState<FrontOfficeEmployee[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableEmployees({
        date,
        start_time: startTime,
        end_time: endTime,
        department_id: departmentId || undefined,
      });
      setResults(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to find available employees'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Available Employees</h1>
        <p className="text-slate-600 mt-1">Find employees free for a given date and time window</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" variant="primary" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Find Available Employees'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {results !== null && (
        <Card className="border-slate-200">
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">{results.length} employee(s) available</p>
            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No employees available for this window.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((emp) => (
                  <Link key={emp.employee_id} to={`/front-office/employees/${emp.employee_id}`}>
                    <Card className="border-slate-200 hover:border-blue-300 transition-colors h-full">
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-slate-900">{emp.name}</span>
                        </div>
                        <p className="text-sm text-slate-600">{emp.designation || '—'}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="h-3 w-3" />
                          {emp.department?.name ?? `#${emp.department_id}`}
                        </div>
                        {emp.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="h-3 w-3" />
                            {emp.email}
                          </div>
                        )}
                        {emp.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="h-3 w-3" />
                            {emp.phone}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
