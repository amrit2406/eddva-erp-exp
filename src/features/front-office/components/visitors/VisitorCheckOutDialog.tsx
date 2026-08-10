import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';

interface VisitorCheckOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  visitorName: string;
  badgeNumber: string;
  checkInTime: string;
  isSubmitting?: boolean;
}

export default function VisitorCheckOutDialog({
  isOpen,
  onClose,
  onConfirm,
  visitorName,
  badgeNumber,
  checkInTime,
  isSubmitting = false,
}: VisitorCheckOutDialogProps) {
  const checkInDate = new Date(checkInTime);
  const now = new Date();
  const duration = Math.floor((now.getTime() - checkInDate.getTime()) / (1000 * 60)); // minutes

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Out Visitor">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Visitor</p>
              <p className="font-medium text-slate-900">{visitorName}</p>
            </div>
            <div>
              <p className="text-slate-600">Badge Number</p>
              <p className="font-medium text-slate-900">{badgeNumber}</p>
            </div>
            <div>
              <p className="text-slate-600">Check-in Time</p>
              <p className="font-medium text-slate-900">
                {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Duration</p>
              <p className="font-medium text-slate-900">{duration} minutes</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Checking Out...' : 'Check Out'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
