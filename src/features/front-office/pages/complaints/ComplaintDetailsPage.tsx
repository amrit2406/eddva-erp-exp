import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintDetails from '../../components/complaints/ComplaintDetails';
import ComplaintUpdateForm from '../../components/complaints/ComplaintUpdateForm';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import ComplaintStatusActions from '../../components/complaints/ComplaintStatusActions';
import { mockComplaints } from '../../mock/complaints.mock';
import { useState } from 'react';

export default function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const complaint = mockComplaints.find((c) => c.id === id);
  const [status, setStatus] = useState(complaint?.status || 'pending');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const paramId = id || '';

  const handleStatusChange = (newStatus: string) => {
    console.log('Change status:', id, newStatus);
    setStatus(newStatus as any);
  };

  const handleUpdate = (data: any) => {
    console.log('Update complaint:', id, data);
    const newEntry = {
      id: `t${Date.now()}`,
      date: new Date().toISOString(),
      type: 'updated',
      description: 'Complaint updated',
      createdBy: 'Current User',
    };
    setTimeline([newEntry, ...timeline]);
    setShowUpdateForm(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/front-office/complaints">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Complaint Details</h1>
            <p className="text-slate-600 mt-1">View complaint information and updates</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="sm" onClick={() => setShowUpdateForm(!showUpdateForm)}>
            {showUpdateForm ? 'Cancel' : 'Update'}
          </Button>
          <ComplaintStatusActions currentStatus={status} onStatusChange={handleStatusChange} />
        </div>
      </div>

      <ComplaintDetails complaintId={paramId} />

      {showUpdateForm && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Complaint</h3>
            <ComplaintUpdateForm onSubmit={handleUpdate} />
          </div>
        </Card>
      )}

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Activity Timeline</h3>
          <ComplaintTimeline entries={timeline} />
        </div>
      </Card>
    </div>
  );
}
