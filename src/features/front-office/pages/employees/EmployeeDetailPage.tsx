import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Clock, Mail, Phone, Building2, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import {
  getEmployee,
  getEmployeeAppointments,
  getEmployeeAvailability,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from '../../api/employees.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import AvailabilitySlotModal from '../../components/employees/AvailabilitySlotModal';
import type {
  FrontOfficeEmployee,
  EmployeeAppointment,
  AvailabilitySlot,
  AvailabilitySlotFormData,
} from '../../types/employeeRecord.types';
import { cn } from '../../../../utils/cn';

const APPOINTMENT_STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-amber-100 text-amber-700',
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<FrontOfficeEmployee | null>(null);
  const [appointments, setAppointments] = useState<EmployeeAppointment[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [empData, apptData, slotData] = await Promise.all([
        getEmployee(id),
        getEmployeeAppointments(id),
        getEmployeeAvailability(id),
      ]);
      setEmployee(empData);
      setAppointments(apptData);
      setSlots(slotData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load employee'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateSlot() {
    setEditingSlot(null);
    setIsSlotModalOpen(true);
  }

  function openEditSlot(slot: AvailabilitySlot) {
    setEditingSlot(slot);
    setIsSlotModalOpen(true);
  }

  async function handleSlotSubmit(data: AvailabilitySlotFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      if (editingSlot) {
        await updateAvailabilitySlot(editingSlot.slot_id, data);
        toast.success('Availability slot updated.');
      } else {
        await createAvailabilitySlot(id, data);
        toast.success('Availability slot added.');
      }
      const slotData = await getEmployeeAvailability(id);
      setSlots(slotData);
      setIsSlotModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSlot(slotId: number) {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await deleteAvailabilitySlot(slotId);
      setSlots(slots.filter((s) => s.slot_id !== slotId));
      toast.success('Availability slot deleted.');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to delete slot'));
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!employee) {
    return <div className="text-center py-8 text-slate-500">Employee not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/employees" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Employees
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {employee.name}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {employee.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">{employee.designation || '—'}</p>
        </div>
        <Link to={`/front-office/employees/${employee.employee_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> Department
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{employee.department?.name ?? `#${employee.department_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> Email
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{employee.email || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> Phone
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{employee.phone || '—'}</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Availability Slots
            </h3>
            <Button variant="secondary" size="sm" onClick={openCreateSlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Time</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No availability slots configured.
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.slot_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{new Date(slot.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{slot.start_time} – {slot.end_time}</td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            slot.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          )}
                        >
                          {slot.is_available ? 'Available' : 'Blocked'}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditSlot(slot)} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSlot(slot.slot_id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointments
          </h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Visitor</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Purpose</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date & Time</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.appointment_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{appt.visitor?.full_name ?? appt.visitor_name}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{appt.purpose || '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(appt.appointment_date).toLocaleDateString()} · {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-4">
                        <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', APPOINTMENT_STATUS_STYLE[appt.status] ?? 'bg-slate-100 text-slate-600')}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AvailabilitySlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        slot={editingSlot}
        onSubmit={handleSlotSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
