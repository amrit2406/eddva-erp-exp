import { mockComplaints } from '../../mock/complaints.mock';
import RecordDetails from '../common/RecordDetails';
import PriorityBadge from '../common/PriorityBadge';
import { cn } from '../../../../utils/cn';

interface ComplaintDetailsProps {
  complaintId: string;
  className?: string;
}

export default function ComplaintDetails({ complaintId, className }: ComplaintDetailsProps) {
  const complaint = mockComplaints.find((c) => c.id === complaintId);

  if (!complaint) {
    return <div className={cn('text-center py-8 text-slate-500', className)}>Complaint not found</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Complaint Information"
        details={[
          { label: 'Complaint Number', value: complaint.complaintNumber },
          { label: 'Complainant Name', value: complaint.complainantName },
          { label: 'Phone', value: complaint.phone },
          { label: 'Email', value: complaint.email || '-' },
          { label: 'Category', value: complaint.category },
          { label: 'Subject', value: complaint.subject },
          { label: 'Description', value: complaint.description },
          { label: 'Priority', value: <PriorityBadge priority={complaint.priority} /> },
          { label: 'Status', value: complaint.status.replace('_', ' ') },
          { label: 'Assigned To', value: complaint.assignedToName || '-' },
          { label: 'Resolution', value: complaint.resolution || '-' },
          { label: 'Created At', value: new Date(complaint.createdAt).toLocaleString() },
        ]}
      />
    </div>
  );
}
