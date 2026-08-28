import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createEmployee } from '../../api/employees.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEmployeeFormData } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [formData, setFormData] = useState<FrontOfficeEmployeeFormData>({
    name: '',
    department_id: 0,
    designation: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department_id) {
      setError('Select a department.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createEmployee(formData);
      navigate('/front-office/employees');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create employee'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
        <p className="text-slate-600 mt-1">Register a new front office employee</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Priya Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Department *
                </label>
                <select
                  id="department_id"
                  value={formData.department_id || ''}
                  onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-slate-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Front Desk Executive"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., priya.sharma@school.edu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/front-office/employees')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
