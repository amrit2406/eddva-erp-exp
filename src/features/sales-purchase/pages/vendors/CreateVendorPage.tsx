import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VendorForm from '../../components/vendors/VendorForm';

export default function CreateVendorPage() {
  const handleSubmit = (data: any) => {
    console.log('Creating vendor:', data);
    // Handle form submission
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sales-purchase/vendors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Vendor</h1>
          <p className="text-slate-600 mt-1">Create a new vendor record</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VendorForm 
            onSubmit={handleSubmit}
            submitText="Create Vendor"
          />
        </div>
      </Card>
    </div>
  );
}
