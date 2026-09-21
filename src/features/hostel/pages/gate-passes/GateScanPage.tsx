import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import GenericDataView from '../../components/common/GenericDataView';
import { scanGate } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { GenericRecord } from '../../types/hostel.types';

type Direction = 'out' | 'in';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

const EMPTY = { pass_no: '', admission_no: '', resident_id: '', remarks: '' };

// The gate desk: scan a resident out or back in by pass number, admission
// number or resident id (any one is enough).
export default function GateScanPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('gate_passes');
  const [direction, setDirection] = useState<Direction>('out');
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<{ direction: Direction; result: GenericRecord } | null>(null);
  const passNoRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pass_no.trim() && !form.admission_no.trim() && !form.resident_id.trim()) {
      setError('Enter a pass number, admission number or resident ID.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const result = await scanGate(direction, {
        pass_no: form.pass_no,
        admission_no: form.admission_no,
        resident_id: form.resident_id.trim() ? Number(form.resident_id) : undefined,
        remarks: form.remarks,
      });
      toast.success(direction === 'out' ? 'Scanned out' : 'Scanned in');
      setLastScan({ direction, result });
      setForm(EMPTY);
      // Ready for the next scan.
      passNoRef.current?.focus();
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Scan failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/gate-passes" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to gate passes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Gate Scan</h1>
        <p className="text-slate-600 mt-1">Record residents leaving and returning at the gate</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('scan') ? (
            <AccessNotice />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
                {(
                  [
                    { key: 'out', label: 'Scan Out', icon: LogOut },
                    { key: 'in', label: 'Scan In', icon: LogIn },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDirection(key)}
                    className={cn(
                      'inline-flex items-center px-4 py-2 text-sm font-medium transition-colors',
                      direction === key ? 'bg-[#008BE9] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="pass_no" className="block text-sm font-medium text-slate-700 mb-1">
                    Pass Number
                  </label>
                  <input
                    id="pass_no"
                    ref={passNoRef}
                    type="text"
                    value={form.pass_no}
                    onChange={(e) => setForm({ ...form, pass_no: e.target.value })}
                    placeholder="e.g. HGP/2026-27/00012"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="admission_no" className="block text-sm font-medium text-slate-700 mb-1">
                    Admission No
                  </label>
                  <input
                    id="admission_no"
                    type="text"
                    value={form.admission_no}
                    onChange={(e) => setForm({ ...form, admission_no: e.target.value })}
                    placeholder="e.g. ADM/2026/0142"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="resident_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Resident ID
                  </label>
                  <input
                    id="resident_id"
                    type="number"
                    min={1}
                    value={form.resident_id}
                    onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                    placeholder="e.g. 1"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-slate-700 mb-1">
                  Remarks
                </label>
                <input
                  id="remarks"
                  type="text"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Optional note"
                  className={inputClass}
                />
              </div>

              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Scanning...' : direction === 'out' ? 'Scan Out' : 'Scan In'}
              </Button>
            </form>
          )}
        </div>
      </Card>

      {lastScan && (
        <Card className="border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Last scan: {lastScan.direction === 'out' ? 'Out' : 'In'}
            </h2>
          </div>
          <GenericDataView data={lastScan.result} emptyMessage="Scan recorded" />
        </Card>
      )}
    </div>
  );
}
