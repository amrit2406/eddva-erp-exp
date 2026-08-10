import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryDetails from '../../components/enquiries/EnquiryDetails';
import EnquiryFollowupForm from '../../components/enquiries/EnquiryFollowupForm';
import EnquiryFollowupTimeline from '../../components/enquiries/EnquiryFollowupTimeline';
import { useState } from 'react';

export default function EnquiryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followups, setFollowups] = useState<any[]>([]);
  const paramId = id || '';

  const handleAddFollowup = (data: any) => {
    console.log('Add follow-up:', data);
    const newFollowup = {
      id: `f${Date.now()}`,
      ...data,
      createdBy: 'Current User',
    };
    setFollowups([newFollowup, ...followups]);
    setShowFollowupForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/front-office/enquiries">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enquiry Details</h1>
            <p className="text-slate-600 mt-1">View enquiry information and follow-ups</p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowFollowupForm(!showFollowupForm)}>
          <Clock className="h-4 w-4 mr-2" />
          {showFollowupForm ? 'Cancel' : 'Add Follow-up'}
        </Button>
      </div>

      <EnquiryDetails enquiryId={paramId} />

      {showFollowupForm && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Follow-up</h3>
            <EnquiryFollowupForm onSubmit={handleAddFollowup} />
          </div>
        </Card>
      )}

      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Follow-up History</h3>
          <EnquiryFollowupTimeline followups={followups} />
        </div>
      </Card>
    </div>
  );
}
