import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getInvoiceView, getInvoices, type InvoiceView } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { cn } from '../../../../utils/cn';
import { INVOICES_RESOURCE } from '../../utils/invoices';
import { recordId } from '../../utils/records';
import type { GenericRecord, RecordLoader } from '../../types/hostel.types';

type View = 'all' | InvoiceView;

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'outstanding', label: 'Outstanding', empty: 'No invoices are waiting to be paid' },
  { key: 'due', label: 'Due', empty: 'No invoices are due' },
  { key: 'overdue', label: 'Overdue', empty: 'No overdue invoices' },
  { key: 'all', label: 'All Invoices', empty: 'No invoices raised yet' },
];

// Defined once so panels get a stable loader and only refetch on tab change.
const LOADERS: Record<View, RecordLoader> = {
  all: getInvoices,
  outstanding: (params) => getInvoiceView('outstanding', params),
  due: (params) => getInvoiceView('due', params),
  overdue: (params) => getInvoiceView('overdue', params),
};

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'invoice_id');
  return id ? `/hostel/invoices/${id}` : undefined;
};

export default function InvoicesPage() {
  const { can } = useResourceAccess(INVOICES_RESOURCE);
  const [view, setView] = useState<View>('outstanding');
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fee Invoices</h1>
          <p className="text-slate-600 mt-1">Hostel fees billed to residents, and what is still unpaid</p>
        </div>
        {can('create') && (
          <Link to="/hostel/invoices/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        )}
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                view === v.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <RecordPanel key={view} load={LOADERS[view]} emptyMessage={current.empty} rowHref={rowHref} />
      </Card>
    </div>
  );
}
