import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import NewsletterForm from '../../components/newsletters/NewsletterForm';
import { getNewsletter, updateNewsletter } from '../../api/newsletters.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { EMPTY_SEGMENT } from '../../types/newsletters.types';
import type { NewsletterFormData } from '../../types/newsletters.types';

export default function EditNewsletterPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('newsletters');
  const [initial, setInitial] = useState<NewsletterFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getNewsletter(id)
      .then((newsletter) => {
        if (cancelled) return;
        setInitial({
          title: newsletter.title,
          content: newsletter.content,
          target_segment: { ...EMPTY_SEGMENT, ...newsletter.target_segment },
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load newsletter'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: NewsletterFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateNewsletter(id, data);
      toast.success('Newsletter updated');
      navigate(`/alumni/newsletters/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update newsletter'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Newsletter</h1>
        <p className="text-slate-600 mt-1">Update the content and audience</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <NewsletterForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Newsletter"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/newsletters/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
