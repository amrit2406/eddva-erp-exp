import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import { registerAlumniAccount } from '../../api/auth.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { AlumniRegisterFormData } from '../../types/alumni.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const EMPTY: AlumniRegisterFormData = {
  full_name: '',
  email: '',
  phone: '',
  graduation_year: '',
  program: '',
  username: '',
  password: '',
};

// Staff onboard an alumnus and their portal login together — alumni never
// self-register. The profile field set below is a best guess (the endpoint's
// request schema wasn't provided); verify it against the backend before relying
// on it, and see this feature's summary for the fields still to confirm.
export default function RegisterAlumniPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('alumni');
  const [formData, setFormData] = useState<AlumniRegisterFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await registerAlumniAccount(formData);
      toast.success('Alumni account created');
      // No alumni directory list exists yet to navigate to — reset the form
      // for the next registration instead.
      setFormData(EMPTY);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create alumni account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register Alumni</h1>
        <p className="text-slate-600 mt-1">Create an alumni profile and portal login together</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !(can('create') && can('issue_account')) ? (
            <AccessNotice />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alumnus@example.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="graduation_year" className="block text-sm font-medium text-slate-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    id="graduation_year"
                    type="text"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="e.g. 2020"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-slate-700 mb-1">
                    Program / Batch
                  </label>
                  <input
                    id="program"
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    placeholder="e.g. Grade 12 - Science"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                    Portal Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="aarav_sharma"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    Portal Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Alumni#2026"
                    className={inputClass}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setFormData(EMPTY)} disabled={submitting}>
                  Reset
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Alumni Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
