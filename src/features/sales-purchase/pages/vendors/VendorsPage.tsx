import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VendorTable from '../../components/vendors/VendorTable';
import VendorFilters from '../../components/vendors/VendorFilters';

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-slate-600 mt-1">Manage vendor master data and contacts</p>
        </div>
        <Link to="/sales-purchase/vendors/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VendorFilters />
          <div className="mt-4">
            <VendorTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
