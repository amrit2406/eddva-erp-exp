import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import { getAllotment } from '../../api/hostel.api';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

export default function AllotmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [allotment, setAllotment] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getAllotment(id)
      .then((data) => {
        if (!cancelled) setAllotment(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load allotment'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!allotment) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const links = [
    { label: 'View resident', id: relatedId(allotment, 'resident', 'resident_id'), path: '/hostel/residents' },
    { label: 'View room', id: relatedId(allotment, 'room', 'room_id'), path: '/hostel/rooms' },
    { label: 'View bed', id: relatedId(allotment, 'bed', 'bed_id'), path: '/hostel/beds' },
  ].filter((link) => link.id);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/allotments" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to allotments
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Allotment #{id}</h1>
          <RecordStatusBadge status={recordStatus(allotment)} />
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            {links.map((link) => (
              <Link key={link.label} to={`${link.path}/${link.id}`} className="text-[#008BE9] hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={allotment} emptyMessage="No details available" />
      </Card>
    </div>
  );
}
