import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ActionModal, { type ActionValues } from '../residents/ActionModal';
import { updateMessAttendance } from '../../api/hostel.api';
import { useToast } from '../../../../hooks/useToast';
import { MESS_STATUSES } from '../../utils/messAttendance';
import { recordId, recordStatus } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

interface EditStatusButtonProps {
  record: GenericRecord;
  onDone: () => void;
}

// Changes one meal record's status (e.g. opted in -> attended).
export default function EditStatusButton({ record, onDone }: EditStatusButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const id = recordId(record, 'mess_attendance_id', 'attendance_id');

  if (!id) return null;

  const handleSubmit = async (values: ActionValues) => {
    await updateMessAttendance(id, values.status);
    toast.success('Meal record updated');
    setOpen(false);
    onDone();
  };

  return (
    <>
      <Button variant="ghost" size="sm" title="Change status" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      {open && (
        <ActionModal
          isOpen
          title="Change Meal Status"
          submitLabel="Save"
          fields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [...MESS_STATUSES],
              required: true,
              defaultValue: recordStatus(record) ?? '',
            },
          ]}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
