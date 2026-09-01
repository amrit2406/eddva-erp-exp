import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/errors';
import { RETURN_CONDITION_OPTIONS } from '../../constants/issue.constants';
import type { InventoryIssue, InventoryReturnFormData, InventoryReturnCondition } from '../../types/issue.types';

interface ReturnIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: InventoryIssue | null;
  onSubmit: (data: InventoryReturnFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ReturnIssueModal({ isOpen, onClose, issue, onSubmit, isLoading }: ReturnIssueModalProps) {
  const isAsset = !!issue?.asset_unit_id;
  const remaining = issue ? issue.quantity - issue.quantity_returned : 0;

  const [quantityReturned, setQuantityReturned] = useState(1);
  const [condition, setCondition] = useState<InventoryReturnCondition>('good');
  const [remarks, setRemarks] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && issue) {
      setQuantityReturned(issue.quantity - issue.quantity_returned);
      setCondition('good');
      setRemarks('');
      setReturnDate(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [isOpen, issue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAsset && quantityReturned > remaining) {
      setError(`Only ${remaining} unit(s) remain outstanding.`);
      return;
    }
    setError(null);
    try {
      await onSubmit({
        quantity_returned: isAsset ? undefined : quantityReturned,
        condition,
        remarks: remarks || undefined,
        return_date: returnDate,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to return issue'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Issue" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {issue && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{issue.item?.name ?? `Item #${issue.item_id}`}</span>
            {isAsset && issue.asset_unit && <span> — {issue.asset_unit.asset_tag}</span>}
            {!isAsset && <span> — {remaining} of {issue.quantity} outstanding</span>}
          </div>
        )}

        {!isAsset && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Returned *</label>
            <input
              type="number"
              min={1}
              max={remaining}
              value={quantityReturned}
              onChange={(e) => setQuantityReturned(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Condition *</label>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value as InventoryReturnCondition)}
            options={RETURN_CONDITION_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            placeholder="e.g., Minor scuff on the casing"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Returning...' : 'Return'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
