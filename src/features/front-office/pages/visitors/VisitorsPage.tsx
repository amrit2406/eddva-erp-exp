import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorTable from '../../components/visitors/VisitorTable';
import VisitorFilters from '../../components/visitors/VisitorFilters';

export default function VisitorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Register</h1>
          <p className="text-slate-600 mt-1">Manage visitor records and check-ins</p>
        </div>
        <Link to="/front-office/visitors/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Register Visitor
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VisitorFilters />
          <div className="mt-4">
            <VisitorTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
