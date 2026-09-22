import { useState } from 'react';
import { Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import GenericDataView from '../common/GenericDataView';
import { previewSegment } from '../../api/newsletters.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { RecordResult } from '../../types/profile.types';
import type { TargetSegment } from '../../types/newsletters.types';

interface SegmentPreviewButtonProps {
  segment: TargetSegment;
}

export default function SegmentPreviewButton({ segment }: SegmentPreviewButtonProps) {
  const [result, setResult] = useState<RecordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(await previewSegment(segment));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to preview audience'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button type="button" variant="secondary" size="sm" onClick={handlePreview} disabled={loading}>
        <Eye className="h-4 w-4 mr-2" />
        {loading ? 'Loading...' : 'Preview Audience'}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <div className="rounded-lg border border-slate-200">
          <GenericDataView data={result.data} emptyMessage="No alumni match this segment" />
        </div>
      )}
    </div>
  );
}
