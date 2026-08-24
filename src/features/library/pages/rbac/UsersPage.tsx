import { Link } from 'react-router-dom';
import { Plus, Users, Shield, Trash2, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import {
  getUserAssignments,
  revokeUserAssignment,
  resetUserAssignmentPassword,
} from '../../api/library.api';
import type { UserAssignment } from '../../types/library.types';

export default function UsersPage() {
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [resetTarget, setResetTarget] = useState<UserAssignment | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      const data = await getUserAssignments();
      setAssignments(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load user assignments');
    } finally {
      setLoading(false);
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    const query = search.toLowerCase();
    return (
      assignment.user_name.toLowerCase().includes(query) ||
      assignment.user_email.toLowerCase().includes(query) ||
      assignment.username.toLowerCase().includes(query) ||
      (assignment.role?.name ?? '').toLowerCase().includes(query)
    );
  });

  const handleRevoke = async (id: number, userName: string) => {
    if (!window.confirm(`Revoke library access for "${userName}"?`)) {
      return;
    }
    try {
      await revokeUserAssignment(id);
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to revoke assignment'));
    }
  };

  const openResetModal = (assignment: UserAssignment) => {
    setResetTarget(assignment);
    setNewPassword('');
    setResetError(null);
    setResetSuccess(null);
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setNewPassword('');
    setResetError(null);
    setResetSuccess(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;

    try {
      setResetting(true);
      setResetError(null);
      const result = await resetUserAssignmentPassword(resetTarget.id, {
        new_password: newPassword,
      });
      setResetSuccess(result.message);
      setNewPassword('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setResetError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">Manage library user role assignments</p>
        </div>
        <Link to="/library/users/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Assign User
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Search by name, email, username, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Username</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No user assignments found
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{assignment.user_name}</div>
                            <div className="text-xs text-slate-500">{assignment.eddva_user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{assignment.user_email}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {assignment.username}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Shield className="h-3 w-3" />
                          {assignment.role?.name ?? `Role #${assignment.role_id}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetModal(assignment)}
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4 text-[#008BE9]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(assignment.id, assignment.user_name)}
                            title="Revoke assignment"
                          >
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
        )}
      </Card>

      <Modal
        isOpen={!!resetTarget}
        onClose={closeResetModal}
        title={`Reset Password — ${resetTarget?.username ?? ''}`}
        size="sm"
      >
        {resetSuccess ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {resetSuccess}
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={closeResetModal}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {resetError}
              </div>
            )}
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                placeholder="NewLibraryPass#2026"
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeResetModal} disabled={resetting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={resetting}>
                {resetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
