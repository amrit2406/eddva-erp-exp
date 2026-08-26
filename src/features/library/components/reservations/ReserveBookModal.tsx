import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { useToast } from '../../../../hooks/useToast';
import { getMembers } from '../../api/library.api';
import { reserveBook } from '../../api/reservations.api';
import { getApiErrorMessage } from '../../utils/apiError';
import type { Member } from '../../types/library.types';

interface ReserveBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
  onReserved?: () => void;
}

export default function ReserveBookModal({ isOpen, onClose, bookId, bookTitle, onReserved }: ReserveBookModalProps) {
  const { toast } = useToast();
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMemberQuery('');
      setMemberResults([]);
      setSelectedMember(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!memberQuery.trim()) {
      setMemberResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await getMembers({ search: memberQuery.trim() });
        setMemberResults(results);
      } catch {
        setMemberResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [memberQuery]);

  async function handleConfirm() {
    if (!selectedMember) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await reserveBook(bookId, { member_id: selectedMember.member_id });
      toast.success(`Reserved "${bookTitle}" for ${selectedMember.name}`);
      onReserved?.();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to place reservation'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Book" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
          <span className="font-medium">Book:</span> {bookTitle}
        </div>

        {selectedMember ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">{selectedMember.name}</p>
              <p className="text-sm text-green-700">
                Card: {selectedMember.library_card_number} | {selectedMember.member_type}
              </p>
            </div>
            <button onClick={() => setSelectedMember(null)} className="text-sm text-green-700 hover:text-green-900">
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Member</label>
            <Input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Search by name or card number..."
            />
            {memberResults.length > 0 && (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {memberResults.map((member) => (
                  <button
                    key={member.member_id}
                    onClick={() => setSelectedMember(member)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    <span className="font-medium text-slate-900">{member.name}</span>
                    <span className="text-slate-500"> — {member.library_card_number} ({member.status})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!selectedMember || isSubmitting}>
            {isSubmitting ? 'Reserving...' : 'Reserve'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
