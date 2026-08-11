import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintForm from '../../components/complaints/ComplaintForm';

export default function CreateComplaintPage() {
  const handleSubmit = (data: any) => {
    console.log('Create complaint:', data);
    // Will be connected to API later
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/front-office/complaints">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Complaint</h1>
          <p className="text-slate-600 mt-1">Create a new complaint record</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ComplaintForm onSubmit={handleSubmit} submitText="Create Complaint" />
        </div>
      </Card>
    </div>
  );
}
