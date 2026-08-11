import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorForm from '../../components/visitors/VisitorForm';
import { mockVisitors } from '../../mock/visitors.mock';

export default function EditVisitorPage() {
  const { id } = useParams<{ id: string }>();
  const visitor = mockVisitors.find((v) => v.id === id);

  const handleSubmit = (data: any) => {
    console.log('Update visitor:', id, data);
    // Will be connected to API later
  };

  if (!visitor) {
    return (
      <div className="text-center py-8 text-slate-500">
        Visitor not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`/front-office/visitors/${id}`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Visitor</h1>
          <p className="text-slate-600 mt-1">Update visitor information</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VisitorForm
            defaultValues={visitor}
            onSubmit={handleSubmit}
            submitText="Update Visitor"
          />
        </div>
      </Card>
    </div>
  );
}
