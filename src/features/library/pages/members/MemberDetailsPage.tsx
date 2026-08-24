import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMember, getMemberCurrentIssues, getMemberFines } from '../../api/library.api';
import type { Member, BookIssue, Fine } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [currentIssues, setCurrentIssues] = useState<BookIssue[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [memberData, issuesData, finesData] = await Promise.all([
        getMember(id),
        getMemberCurrentIssues(id),
        getMemberFines(id)
      ]);
      setMember(memberData);
      setCurrentIssues(issuesData);
      setFines(finesData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Details</h1>
          <p className="text-slate-600 mt-1">View member information and activity</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Details</h1>
          <p className="text-slate-600 mt-1">View member information and activity</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error || 'Member not found'}</div>
        </Card>
      </div>
    );
  }

  const totalFines = fines.reduce((sum, fine) => sum + (fine.paid ? 0 : fine.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={ROUTES.LIBRARY_MEMBERS}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Details</h1>
          <p className="text-slate-600 mt-1">View member information and activity</p>
        </div>
      </div>

      {/* Member Info Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">External Ref ID</p>
              <p className="font-mono text-slate-900">{member.external_ref_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Name</p>
              <p className="font-medium text-slate-900">{member.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Member Type</p>
              <p className="capitalize text-slate-900">{member.member_type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Joined Date</p>
              <p className="text-slate-900">{new Date(member.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Issues Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Current Book Issues
            </h2>
            <span className="text-sm text-slate-600">{currentIssues.length} book(s)</span>
          </div>
          {currentIssues.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No current book issues
            </div>
          ) : (
            <div className="space-y-3">
              {currentIssues.map((issue) => (
                <div key={issue.issue_id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{issue.book_title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Issued: {new Date(issue.issue_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Due: {new Date(issue.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      issue.status === 'overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : issue.status === 'returned'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {issue.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Fines Card */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Fines
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Total Outstanding:</span>
              <span className="text-lg font-bold text-red-600">₹{totalFines.toFixed(2)}</span>
            </div>
          </div>
          {fines.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No fines
            </div>
          ) : (
            <div className="space-y-3">
              {fines.map((fine) => (
                <div key={fine.fine_id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{fine.reason}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(fine.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">₹{fine.amount.toFixed(2)}</span>
                      {fine.paid ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Unpaid</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}