import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import StaffTable from '../../components/staff/StaffTable';
import { getStaffList, deleteStaffMember } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsStaff } from '../../types/sports.types';

export default function StaffPage() {
  const [staff, setStaff] = useState<SportsStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      setLoading(true);
      const data = await getStaffList();
      setStaff(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load staff'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    try {
      await deleteStaffMember(id);
      setStaff(staff.filter((s) => s.staff_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete staff member'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
          <p className="text-slate-600 mt-1">Manage coaches, house masters, and officials</p>
        </div>
        <Link to="/sports/staff/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <StaffTable staff={staff} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}
