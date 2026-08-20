import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPosTerminals, deletePosTerminal } from '../../api/canteen.api';
import type { PosTerminal } from '../../types/canteen.types';

export default function PosTerminalsPage() {
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this terminal?')) {
      return;
    }
    try {
      await deletePosTerminal(id);
      setTerminals(terminals.filter((t) => t.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete terminal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">POS Terminals</h1>
          <p className="text-slate-600 mt-1">Manage canteen POS terminals</p>
        </div>
        <Link to="/canteen/pos/terminals/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Terminal
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Location</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {terminals.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-500">
                      No terminals found
                    </td>
                  </tr>
                ) : (
                  terminals.map((terminal) => (
                    <tr key={terminal.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{terminal.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{terminal.location}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/canteen/pos/terminals/${terminal.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(terminal.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
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
