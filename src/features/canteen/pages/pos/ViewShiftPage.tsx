import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getShift, closeShift, getPosTerminals } from '../../api/canteen.api';
import type { Shift, PosTerminal } from '../../types/canteen.types';

export default function ViewShiftPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [shift, setShift] = useState<Shift | null>(null);
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [closingCash, setClosingCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [shiftData, terminalsData] = await Promise.all([
        getShift(id),
        getPosTerminals()
      ]);
      setShift(shiftData);
      setTerminals(terminalsData);
      setClosingCash(shiftData.closingCash || 0);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const getTerminalName = (terminalId: string) => {
    const terminal = terminals.find(t => t.id === terminalId);
    return terminal ? terminal.name : terminalId;
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (closingCash < 0) {
      setError('Closing cash cannot be negative');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await closeShift(id, { closingCash });
      loadData();
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      // console.error('Close shift error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to close shift');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Details</h1>
          <p className="text-slate-600 mt-1">View shift information</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Details</h1>
          <p className="text-slate-600 mt-1">View shift information</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Shift not found</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shift Details</h1>
          <p className="text-slate-600 mt-1">View shift information</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/canteen/pos/shifts')}>
          Back to Shifts
        </Button>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Terminal</label>
              <p className="text-slate-900">{getTerminalName(shift.terminalId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Status</label>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${shift.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {shift.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Opening Cash</label>
              <p className="text-slate-900">₹{shift.openingCash}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Closing Cash</label>
              <p className="text-slate-900">{shift.closingCash ? `₹${shift.closingCash}` : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Opened At</label>
              <p className="text-slate-900">{new Date(shift.openedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Closed At</label>
              <p className="text-slate-900">{shift.closedAt ? new Date(shift.closedAt).toLocaleString() : '-'}</p>
            </div>
          </div>

          {shift.status === 'OPEN' && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Close Shift</h3>
              <form onSubmit={handleCloseShift} className="space-y-4">
                <div className="max-w-xs">
                  <label htmlFor="closingCash" className="block text-sm font-medium text-slate-700 mb-1">
                    Closing Cash *
                  </label>
                  <input
                    type="number"
                    id="closingCash"
                    value={closingCash}
                    onChange={(e) => setClosingCash(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                    required
                    step="0.01"
                  />
                </div>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Closing...' : 'Close Shift'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
