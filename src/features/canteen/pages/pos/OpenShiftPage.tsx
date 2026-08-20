import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { openShift, getPosTerminals } from '../../api/canteen.api';
import type { PosTerminal } from '../../types/canteen.types';

export default function OpenShiftPage() {
  const navigate = useNavigate();
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [formData, setFormData] = useState({ terminalId: '', openingCash: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTerminals();
  }, []);

  async function loadTerminals() {
    try {
      setLoading(true);
      const data = await getPosTerminals();
      setTerminals(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load terminals');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terminalId) {
      setError('Please select a terminal');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const result = await openShift(formData);
      navigate(`/canteen/pos/shifts/${result.id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to open shift');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Open Shift</h1>
          <p className="text-slate-600 mt-1">Open a new POS shift</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading terminals...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Open Shift</h1>
        <p className="text-slate-600 mt-1">Open a new POS shift</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="terminalId" className="block text-sm font-medium text-slate-700 mb-1">
                  Terminal *
                </label>
                <select
                  id="terminalId"
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select a terminal</option>
                  {terminals.map((terminal) => (
                    <option key={terminal.id} value={terminal.id}>
                      {terminal.name} - {terminal.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="openingCash" className="block text-sm font-medium text-slate-700 mb-1">
                  Opening Cash *
                </label>
                <input
                  type="number"
                  id="openingCash"
                  value={formData.openingCash}
                  onChange={(e) => setFormData({ ...formData, openingCash: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/canteen/pos/shifts')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Opening...' : 'Open Shift'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
