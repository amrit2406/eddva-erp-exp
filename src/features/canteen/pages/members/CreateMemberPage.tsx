import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createMember } from '../../api/canteen.api';

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    memberType: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'STAFF' | 'GUEST',
    idCardBarcode: '',
    externalRefId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createMember(formData);
      navigate('/canteen/members');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Member</h1>
        <p className="text-slate-600 mt-1">Add a new canteen member</p>
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
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="memberType" className="block text-sm font-medium text-slate-700 mb-1">
                  Member Type *
                </label>
                <select
                  id="memberType"
                  value={formData.memberType}
                  onChange={(e) => setFormData({ ...formData, memberType: e.target.value as 'STUDENT' | 'TEACHER' | 'STAFF' | 'GUEST' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STAFF">Staff</option>
                  <option value="GUEST">Guest</option>
                </select>
              </div>

              <div>
                <label htmlFor="idCardBarcode" className="block text-sm font-medium text-slate-700 mb-1">
                  ID Card Barcode *
                </label>
                <input
                  type="text"
                  id="idCardBarcode"
                  value={formData.idCardBarcode}
                  onChange={(e) => setFormData({ ...formData, idCardBarcode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="externalRefId" className="block text-sm font-medium text-slate-700 mb-1">
                  External Ref ID *
                </label>
                <input
                  type="text"
                  id="externalRefId"
                  value={formData.externalRefId}
                  onChange={(e) => setFormData({ ...formData, externalRefId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/canteen/members')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Member'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
