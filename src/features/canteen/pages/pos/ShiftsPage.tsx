import { Link } from 'react-router-dom';
import { Plus, Eye, PlayCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getShifts, getPosTerminals } from '../../api/canteen.api';
import type { Shift, PosTerminal } from '../../types/canteen.types';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [shiftsData, terminalsData] = await Promise.all([
        getShifts(),
        getPosTerminals()
      ]);
      setShifts(shiftsData);
      setTerminals(terminalsData);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shifts</h1>
          <p className="text-slate-600 mt-1">Manage canteen POS shifts</p>
        </div>
        <Link to="/canteen/pos/shifts/open">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Open Shift
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Terminal</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Opening Cash</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Closing Cash</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Opened At</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No shifts found
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{getTerminalName(shift.terminalId)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">₹{shift.openingCash}</td>
                      <td className="py-3 px-4 text-slate-600">{shift.closingCash ? `₹${shift.closingCash}` : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${shift.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {shift.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{new Date(shift.openedAt).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/canteen/pos/shifts/${shift.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
