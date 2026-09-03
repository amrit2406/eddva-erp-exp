import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportDriverDocumentFormData } from '../../types/driver.types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportDriverDocumentFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddDocumentModal({ isOpen, onClose, onSubmit, isLoading }: AddDocumentModalProps) {
  const [formData, setFormData] = useState<TransportDriverDocumentFormData>({
    doc_type: '',
    doc_url: '',
    expiry_date: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ doc_type: '', doc_url: '', expiry_date: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doc_type.trim() || !formData.doc_url.trim()) {
      setError('Document type and URL are required.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add document'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Type *</label>
          <input
            type="text"
            value={formData.doc_type}
            onChange={(e) => setFormData({ ...formData, doc_type: e.target.value })}
            placeholder="e.g., medical_certificate"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document URL *</label>
          <input
            type="text"
            value={formData.doc_url}
            onChange={(e) => setFormData({ ...formData, doc_url: e.target.value })}
            placeholder="https://storage/doc.pdf"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
          <input
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
