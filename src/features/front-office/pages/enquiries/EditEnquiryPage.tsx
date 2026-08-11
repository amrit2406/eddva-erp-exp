import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryForm from '../../components/enquiries/EnquiryForm';
import { mockEnquiries } from '../../mock/enquiries.mock';

export default function EditEnquiryPage() {
  const { id } = useParams<{ id: string }>();
  const enquiry = mockEnquiries.find((e) => e.id === id);

  const handleSubmit = (data: any) => {
    console.log('Update enquiry:', id, data);
    // Will be connected to API later
  };

  if (!enquiry) {
    return (
      <div className="text-center py-8 text-slate-500">
        Enquiry not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`/front-office/enquiries/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Enquiry</h1>
          <p className="text-slate-600 mt-1">Update enquiry information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <EnquiryForm
            defaultValues={enquiry}
            onSubmit={handleSubmit}
            submitText="Update Enquiry"
          />
        </div>
      </Card>
    </div>
  );
}
