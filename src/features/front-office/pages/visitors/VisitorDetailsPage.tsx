import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import VisitorDetails from '../../components/visitors/VisitorDetails';
import VisitorCheckOutDialog from '../../components/visitors/VisitorCheckOutDialog';
import { useState } from 'react';

export default function VisitorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const paramId = id || '';

  const handleCheckOut = () => {
    console.log('Check out visitor:', id);
    setShowCheckOutDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/front-office/visitors">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visitor Details</h1>
            <p className="text-slate-600 mt-1">View visitor information and visit history</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Check In
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCheckOutDialog(true)}>
            <LogOut className="h-4 w-4 mr-2" />
            Check Out
          </Button>
        </div>
      </div>

      <VisitorDetails visitorId={paramId} />

      <VisitorCheckOutDialog
        isOpen={showCheckOutDialog}
        onClose={() => setShowCheckOutDialog(false)}
        onConfirm={handleCheckOut}
        visitorName="John Smith"
        badgeNumber="V001"
        checkInTime="2026-08-10T09:15:00Z"
      />
    </div>
  );
}
