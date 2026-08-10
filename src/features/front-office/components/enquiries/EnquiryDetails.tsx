import { mockEnquiries } from '../../mock/enquiries.mock';
import RecordDetails from '../common/RecordDetails';
import { cn } from '../../../../utils/cn';

interface EnquiryDetailsProps {
  enquiryId: string;
  className?: string;
}

export default function EnquiryDetails({ enquiryId, className }: EnquiryDetailsProps) {
  const enquiry = mockEnquiries.find((e) => e.id === enquiryId);

  if (!enquiry) {
    return <div className={cn('text-center py-8 text-slate-500', className)}>Enquiry not found</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Enquiry Information"
        details={[
          { label: 'Enquiry Number', value: enquiry.enquiryNumber },
          { label: 'Enquirer Name', value: enquiry.enquirerName },
          { label: 'Phone', value: enquiry.phone },
          { label: 'Email', value: enquiry.email || '-' },
          { label: 'Source', value: enquiry.source.replace('_', ' ') },
          { label: 'Category', value: enquiry.category },
          { label: 'Status', value: enquiry.status.replace('_', ' ') },
          { label: 'Assigned To', value: enquiry.assignedToName || '-' },
          { label: 'Next Follow-up', value: enquiry.nextFollowUpDate ? new Date(enquiry.nextFollowUpDate).toLocaleDateString() : '-' },
          { label: 'Notes', value: enquiry.notes || '-' },
          { label: 'Created At', value: new Date(enquiry.createdAt).toLocaleString() },
        ]}
      />
    </div>
  );
}
