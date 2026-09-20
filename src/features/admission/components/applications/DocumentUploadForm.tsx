import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { formatFileSize } from '../../utils/format';
import type { DocumentUploadData } from '../../types/admission.types';

interface DocumentUploadFormProps {
  submitting: boolean;
  error: string | null;
  onSubmit: (data: DocumentUploadData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const TYPE_SUGGESTIONS = [
  'Birth Certificate',
  'Transfer Certificate',
  'Previous Marksheet',
  'Address Proof',
  'Guardian ID Proof',
  'Passport Photo',
];

export default function DocumentUploadForm({ submitting, error, onSubmit, onCancel }: DocumentUploadFormProps) {
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit({ document_type: documentType, file });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="document_type" className={labelClass}>Document Type *</label>
          <input
            id="document_type"
            type="text"
            list="document-types"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g. Birth Certificate"
            className={inputClass}
            required
          />
          <datalist id="document-types">
            {TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="document_file" className={labelClass}>File *</label>
          <input
            id="document_file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            required
          />
          {file && <p className="text-xs text-slate-500 mt-1">{file.name} · {formatFileSize(file.size)}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={submitting || !file}>
          {submitting ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </form>
  );
}
