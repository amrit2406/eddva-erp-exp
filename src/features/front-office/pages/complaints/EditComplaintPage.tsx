import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import { mockComplaints } from '../../mock/complaints.mock';

export default function EditComplaintPage() {
  const { id } = useParams<{ id: string }>();
  const complaint = mockComplaints.find((c) => c.id === id);

  const handleSubmit = (data: any) => {
    console.log('Update complaint:', id, data);
    // Will be connected to API later
  };

  if (!complaint) {
    return (
      <div className="text-center py-8 text-slate-500">
        Complaint not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/front-office/complaints/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Complaint</h1>
          <p className="text-slate-600 mt-1">Update complaint information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ComplaintForm
            defaultValues={complaint}
            onSubmit={handleSubmit}
            submitText="Update Complaint"
          />
        </div>
      </Card>
    </div>
  );
}
