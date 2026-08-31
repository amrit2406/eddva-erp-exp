import RecordDetails from '../common/RecordDetails';
import PriorityBadge from '../common/PriorityBadge';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeComplaint } from '../../types/complaintRecord.types';

interface ComplaintDetailsProps {
  complaint: FrontOfficeComplaint;
  className?: string;
}

export default function ComplaintDetails({ complaint, className }: ComplaintDetailsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Complaint Information"
        details={[
          { label: 'Complainant Name', value: complaint.complainant_name },
          { label: 'Phone', value: complaint.phone || '—' },
          { label: 'Email', value: complaint.email || '—' },
          { label: 'Category', value: complaint.category },
          { label: 'Description', value: complaint.description },
          { label: 'Priority', value: <PriorityBadge priority={complaint.priority} /> },
          { label: 'Status', value: complaint.status.replace('_', ' ') },
          { label: 'Assigned To', value: complaint.assignee?.name || '—' },
          { label: 'Resolved At', value: complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleString() : '—' },
          { label: 'Created At', value: new Date(complaint.created_at).toLocaleString() },
        ]}
      />
    </div>
  );
}
