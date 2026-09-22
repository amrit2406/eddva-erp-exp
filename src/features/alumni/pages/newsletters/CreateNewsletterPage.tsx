import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import NewsletterForm from '../../components/newsletters/NewsletterForm';
import { createNewsletter } from '../../api/newsletters.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import { EMPTY_SEGMENT } from '../../types/newsletters.types';
import type { NewsletterFormData } from '../../types/newsletters.types';

const EMPTY: NewsletterFormData = { title: '', content: '', target_segment: EMPTY_SEGMENT };

export default function CreateNewsletterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('newsletters');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: NewsletterFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const newsletter = await createNewsletter(data);
      toast.success('Newsletter created');
      navigate(`/alumni/newsletters/${newsletter.newsletter_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create newsletter'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Newsletter</h1>
        <p className="text-slate-600 mt-1">Draft an update and choose who receives it</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <NewsletterForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Newsletter"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/newsletters')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
