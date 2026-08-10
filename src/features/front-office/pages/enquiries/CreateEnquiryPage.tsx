import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryForm from '../../components/enquiries/EnquiryForm';

export default function CreateEnquiryPage() {
  const handleSubmit = (data: any) => {
    console.log('Create enquiry:', data);
    // Will be connected to API later
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/front-office/enquiries">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Enquiry</h1>
          <p className="text-slate-600 mt-1">Create a new enquiry record</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <EnquiryForm onSubmit={handleSubmit} submitText="Create Enquiry" />
        </div>
      </Card>
    </div>
  );
}
