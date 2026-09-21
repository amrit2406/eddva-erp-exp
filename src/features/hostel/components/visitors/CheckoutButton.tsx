import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ActionModal from '../residents/ActionModal';
import { checkoutVisitor } from '../../api/hostel.api';
import { useToast } from '../../../../hooks/useToast';
import { recordId } from '../../utils/records';
import { isCheckedOut } from '../../utils/visitors';
import type { GenericRecord } from '../../types/hostel.types';

interface CheckoutButtonProps {
  visitor: GenericRecord;
  size?: 'sm' | 'md';
  onDone: () => void;
}

// Records a visitor leaving. Renders nothing once they have already left.
export default function CheckoutButton({ visitor, size = 'sm', onDone }: CheckoutButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const id = recordId(visitor, 'visitor_id');

  if (!id || isCheckedOut(visitor)) return null;

  const name = typeof visitor.visitor_name === 'string' && visitor.visitor_name ? visitor.visitor_name : 'this visitor';

  return (
    <>
      <Button variant="secondary" size={size} onClick={() => setOpen(true)}>
        <LogOut className="h-4 w-4 mr-2" />
        Check Out
      </Button>
      {open && (
        <ActionModal
          isOpen
          title="Check Out Visitor"
          description={`Record that ${name} has left the hostel.`}
          submitLabel="Check Out"
          fields={[]}
          onClose={() => setOpen(false)}
          onSubmit={async () => {
            await checkoutVisitor(id);
            toast.success('Visitor checked out');
            setOpen(false);
            onDone();
          }}
        />
      )}
    </>
  );
}
