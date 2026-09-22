import { useState } from 'react';
import { Upload } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';

interface PhotoUploaderProps {
  currentPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
}

export default function PhotoUploader({ currentPhotoUrl, onUpload }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (selected: File | null) => {
    setFile(selected);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      await onUpload(file);
      handleSelect(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to upload photo'));
    } finally {
      setUploading(false);
    }
  };

  const shown = preview ?? currentPhotoUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
        {shown ? (
          <img src={shown} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <Upload className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <div className="space-y-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        {file && (
          <Button type="button" size="sm" variant="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        )}
      </div>
    </div>
  );
}
