import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';

export default function ComplaintsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Register</h1>
          <p className="text-slate-600 mt-1">Manage complaints and resolutions</p>
        </div>
        <Link to="/front-office/complaints/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ComplaintFilters />
          <div className="mt-4">
            <ComplaintTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
