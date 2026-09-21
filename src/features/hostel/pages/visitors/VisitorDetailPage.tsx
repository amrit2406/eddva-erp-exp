import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import CheckoutButton from '../../components/visitors/CheckoutButton';
import { getVisitor } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { relatedId } from '../../utils/records';
import { VISITORS_RESOURCE, isCheckedOut } from '../../utils/visitors';
import type { GenericRecord } from '../../types/hostel.types';

export default function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, ready } = useResourceAccess(VISITORS_RESOURCE);
  const [visitor, setVisitor] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getVisitor(id)
      .then((data) => {
        if (!cancelled) setVisitor(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load visitor'));
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!visitor || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const name = typeof visitor.visitor_name === 'string' && visitor.visitor_name ? visitor.visitor_name : `Visitor #${id}`;
  const residentId = relatedId(visitor, 'resident', 'resident_id');
  const left = isCheckedOut(visitor);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/visitors" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to visitors
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
              <Badge variant={left ? 'neutral' : 'success'}>{left ? 'Checked out' : 'Inside'}</Badge>
            </div>
            {residentId && (
              <Link to={`/hostel/residents/${residentId}`} className="inline-block mt-2 text-sm text-[#008BE9] hover:underline">
                View resident
              </Link>
            )}
          </div>

          {(can('checkout') || can('update')) && (
            <CheckoutButton
              visitor={{ ...visitor, visitor_id: visitor.visitor_id ?? id }}
              size="md"
              onDone={() => setReloadKey((key) => key + 1)}
            />
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={visitor} emptyMessage="No details available" />
      </Card>
    </div>
  );
}
