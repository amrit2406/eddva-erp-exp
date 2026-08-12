import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CustomerTable from '../../components/customers/CustomerTable';
import CustomerFilters from '../../components/customers/CustomerFilters';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-slate-600 mt-1">Manage customer master data and contacts</p>
        </div>
        <Link to="/sales-purchase/customers/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <CustomerFilters />
          <div className="mt-4">
            <CustomerTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
