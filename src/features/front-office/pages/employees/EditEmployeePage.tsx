import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getEmployee, updateEmployee } from '../../api/employees.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEmployeeUpdateData, FrontOfficeEmployeeStatus } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [formData, setFormData] = useState<FrontOfficeEmployeeUpdateData>({
    name: '',
    department_id: 0,
    designation: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getEmployee(id);
      setFormData({
        name: data.name,
        department_id: data.department_id,
        designation: data.designation ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        status: data.status,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load employee'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateEmployee(id, formData);
      navigate('/front-office/employees');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update employee'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Employee</h1>
          <p className="text-slate-600 mt-1">Update employee details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Employee</h1>
        <p className="text-slate-600 mt-1">Update employee details</p>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as FrontOfficeEmployeeStatus })}
                  options={STATUS_OPTIONS}
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
                {submitting ? 'Updating...' : 'Update Employee'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
