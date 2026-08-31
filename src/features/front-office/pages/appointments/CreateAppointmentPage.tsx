import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { createAppointment } from '../../api/appointments.api';
import { getEmployees } from '../../api/employees.api';
import { getDepartments } from '../../api/departments.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { AppointmentFormData } from '../../types/appointmentRecord.types';
import type { FrontOfficeEmployee } from '../../types/employeeRecord.types';
import type { FrontOfficeDepartment } from '../../types/departmentRecord.types';

const EMPTY_FORM: AppointmentFormData = {
  visitor_id: undefined,
  visitor_name: '',
  phone: '',
  host_employee_id: 0,
  department_id: 0,
  appointment_date: '',
  start_time: '',
  end_time: '',
  purpose: '',
};

export default function CreateAppointmentPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<FrontOfficeEmployee[]>([]);
  const [departments, setDepartments] = useState<FrontOfficeDepartment[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployees({ limit: 100 }).then((r) => setEmployees(r.data)).catch(() => setEmployees([]));
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const appointment = await createAppointment(formData);
      navigate(`/front-office/appointments/${appointment.appointment_id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create appointment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/front-office/appointments">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Appointment</h1>
          <p className="text-slate-600 mt-1">Schedule a new visitor appointment</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AppointmentForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/front-office/appointments')}
            employees={employees}
            departments={departments}
            submitText="Create Appointment"
            isSubmitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
