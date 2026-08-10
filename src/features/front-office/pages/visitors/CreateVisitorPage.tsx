import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorForm from '../../components/visitors/VisitorForm';

export default function CreateVisitorPage() {
  const handleSubmit = (data: any) => {
    console.log('Create visitor:', data);
    // Will be connected to API later
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/front-office/visitors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Register New Visitor</h1>
          <p className="text-slate-600 mt-1">Add a new visitor to the system</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VisitorForm onSubmit={handleSubmit} submitText="Register Visitor" />
        </div>
      </Card>
    </div>
  );
}
