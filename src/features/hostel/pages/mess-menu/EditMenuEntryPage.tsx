import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MenuForm from '../../components/mess-menu/MenuForm';
import { getMessMenuEntry, updateMessMenuEntry } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MESS_MENU_RESOURCE } from '../../utils/messMenu';
import type { MessMenuFormData } from '../../types/hostel.types';

export default function EditMenuEntryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(MESS_MENU_RESOURCE);
  const [initial, setInitial] = useState<MessMenuFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getMessMenuEntry(id)
      .then((entry) => {
        if (cancelled) return;
        setInitial({
          day_of_week: entry.day_of_week.toLowerCase(),
          meal_type: entry.meal_type,
          items: entry.items,
          // The API may return a full timestamp; the date input wants YYYY-MM-DD.
          effective_from: (entry.effective_from ?? '').slice(0, 10),
          is_active: entry.is_active !== false,
        });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load menu entry'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: MessMenuFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateMessMenuEntry(id, data);
      toast.success('Menu entry updated');
      navigate('/hostel/mess-menu?tab=entries');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update menu entry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Menu Entry</h1>
        <p className="text-slate-600 mt-1">Change the dishes, day or effective date</p>
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
            <MenuForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Menu Entry"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/mess-menu?tab=entries')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
