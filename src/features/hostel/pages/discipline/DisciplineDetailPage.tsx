import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Link2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import LinkGatePassModal from '../../components/discipline/LinkGatePassModal';
import { getDisciplineRecord, linkDisciplineGatePass } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { DISCIPLINE_RESOURCE } from '../../utils/discipline';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

export default function DisciplineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess(DISCIPLINE_RESOURCE);
  const [record, setRecord] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getDisciplineRecord(id)
      .then((data) => {
        if (!cancelled) setRecord(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load discipline record'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleLink = async (gatePassId: number) => {
    if (!id) return;
    await linkDisciplineGatePass(id, gatePassId);
    toast.success('Gate pass linked');
    setLinking(false);
    setRecord(await getDisciplineRecord(id));
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!record || !ready) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const residentId = relatedId(record, 'resident', 'resident_id');
  const gatePassId = relatedId(record, 'gate_pass', 'gate_pass_id');
  const category = typeof record.category === 'string' ? record.category.replace(/_/g, ' ') : '';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/discipline" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to discipline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{category || `Incident #${id}`}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {residentId && (
                <Link to={`/hostel/residents/${residentId}`} className="text-[#008BE9] hover:underline">
                  View resident
                </Link>
              )}
              {gatePassId && (
                <Link to={`/hostel/gate-passes/${gatePassId}`} className="text-[#008BE9] hover:underline">
                  View gate pass
                </Link>
              )}
            </div>
          </div>
          {(can('link_gate_pass') || can('update')) && (
            <Button variant="secondary" onClick={() => setLinking(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              {gatePassId ? 'Change Gate Pass' : 'Link Gate Pass'}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={record} emptyMessage="No details available" />
      </Card>

      {linking && <LinkGatePassModal residentId={residentId} onClose={() => setLinking(false)} onSubmit={handleLink} />}
    </div>
  );
}
