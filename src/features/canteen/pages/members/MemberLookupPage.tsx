import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMemberByBarcode } from '../../api/canteen.api';
import type { CanteenMember } from '../../types/canteen.types';

export default function MemberLookupPage() {
  const [barcode, setBarcode] = useState('');
  const [member, setMember] = useState<CanteenMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      setError('Please enter a barcode');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setMember(null);
      const data = await getMemberByBarcode(barcode.trim());
      setMember(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      if (err.response?.status === 404) {
        setError('Member not found with this barcode');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to lookup member');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Member Lookup</h1>
        <p className="text-slate-600 mt-1">Lookup member by barcode</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-1">
                Barcode *
              </label>
              <input
                type="text"
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                placeholder="Enter barcode (e.g., BC1002)"
              />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Searching...' : 'Lookup Member'}
            </Button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {member && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Member Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                  <p className="text-slate-900">{member.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Member Type</label>
                  <p className="text-slate-900">{member.memberType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">ID Card Barcode</label>
                  <p className="text-slate-900">{member.idCardBarcode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">External Ref ID</label>
                  <p className="text-slate-900">{member.externalRefId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
