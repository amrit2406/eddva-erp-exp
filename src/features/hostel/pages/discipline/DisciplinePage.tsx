import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getDisciplineRecords } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { DISCIPLINE_RESOURCE } from '../../utils/discipline';
import { recordId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'discipline_record_id', 'record_id');
  return id ? `/hostel/discipline/${id}` : undefined;
};

export default function DisciplinePage() {
  const { can } = useResourceAccess(DISCIPLINE_RESOURCE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discipline</h1>
          <p className="text-slate-600 mt-1">Incidents, the action taken, and any fines</p>
        </div>
        {can('create') && (
          <Link to="/hostel/discipline/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Record Incident
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={getDisciplineRecords} emptyMessage="No discipline records" rowHref={rowHref} />
      </Card>
    </div>
  );
}
