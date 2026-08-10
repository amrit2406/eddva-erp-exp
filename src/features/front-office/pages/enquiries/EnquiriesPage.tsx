import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryTable from '../../components/enquiries/EnquiryTable';
import EnquiryFilters from '../../components/enquiries/EnquiryFilters';

export default function EnquiriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiry Register</h1>
          <p className="text-slate-600 mt-1">Manage enquiries and follow-ups</p>
        </div>
        <Link to="/front-office/enquiries/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Enquiry
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <EnquiryFilters />
          <div className="mt-4">
            <EnquiryTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
