import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import MenuForm from '../../components/mess-menu/MenuForm';
import { createMessMenuEntry } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { MESS_MENU_RESOURCE } from '../../utils/messMenu';
import { todayISO } from '../../utils/residents';
import type { MessMenuFormData } from '../../types/hostel.types';

export default function CreateMenuEntryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(MESS_MENU_RESOURCE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues: MessMenuFormData = {
    day_of_week: 'monday',
    meal_type: '',
    items: [],
    effective_from: todayISO(),
    is_active: true,
  };

  const handleSubmit = async (data: MessMenuFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createMessMenuEntry(data);
      toast.success('Menu entry added');
      navigate('/hostel/mess-menu?tab=entries');
    } catch (err) {
      // e.g. an entry for that day and meal may already exist
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to add menu entry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Menu Entry</h1>
        <p className="text-slate-600 mt-1">Set what is served for one meal on one day</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <MenuForm
              initialValues={initialValues}
              submitting={submitting}
              error={error}
              submitLabel="Add Menu Entry"
              submittingLabel="Adding..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/mess-menu?tab=entries')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
