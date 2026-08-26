import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, User, RotateCcw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import { getIssue, returnIssue, renewIssue } from '../../api/issues.api';
import { getIssueErrorMessage } from '../../utils/issueErrors';
import IssueStatusBadge from '../../components/issues/IssueStatusBadge';
import ReturnIssueModal from '../../components/issues/ReturnIssueModal';
import RenewIssueModal from '../../components/issues/RenewIssueModal';
import FineTable from '../../components/fines/FineTable';
import type { IssueDetail, BookIssueReturnData, BookIssueRenewData } from '../../types/library.types';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getIssue(id);
      setIssue(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getIssueErrorMessage(err, 'Failed to load issue'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(issueId: number, data: BookIssueReturnData) {
    setIsSubmitting(true);
    try {
      const result = await returnIssue(issueId, data);
      await load();
      setIsReturnModalOpen(false);
      toast.success(result.fine ? `Returned. Fine of ₹${result.fine.amount} created.` : 'Returned. No fine.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRenew(issueId: number, data: BookIssueRenewData) {
    setIsSubmitting(true);
    try {
      await renewIssue(issueId, data);
      await load();
      setIsRenewModalOpen(false);
      toast.success('Issue renewed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!issue) {
    return <div className="text-center py-8 text-slate-500">Issue not found.</div>;
  }

  const isActive = !issue.return_date;

  return (
    <div className="space-y-6">
      <Link to="/library/issues" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Issues
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Issue #{issue.issue_id}
            <IssueStatusBadge status={issue.status} />
          </h1>
          <p className="text-slate-600 mt-1">{issue.copy?.book?.title ?? issue.book_title}</p>
        </div>
        {isActive && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsRenewModalOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Renew
            </Button>
            <Button onClick={() => setIsReturnModalOpen(true)}>Return Book</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Copy & Book
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium text-slate-900">Title:</span> {issue.copy?.book?.title ?? issue.book_title}</p>
              <p><span className="font-medium text-slate-900">Author:</span> {issue.copy?.book?.author ?? '—'}</p>
              <p><span className="font-medium text-slate-900">Copy ID:</span> {issue.copy_id}</p>
              <p><span className="font-medium text-slate-900">Barcode:</span> {issue.copy?.barcode ?? '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Member
            </h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium text-slate-900">Name:</span> {issue.member?.name ?? `#${issue.member_id}`}</p>
              <p><span className="font-medium text-slate-900">Card:</span> {issue.member?.library_card_number ?? '—'}</p>
              <p><span className="font-medium text-slate-900">Type:</span> {issue.member?.member_type ?? '—'}</p>
              {issue.member && (
                <Link to={`/library/members/${issue.member_id}`} className="text-blue-600 hover:underline text-sm">
                  View member profile →
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Loan Timeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Issued</p>
                <p className="font-medium text-slate-900">{new Date(issue.issue_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Due</p>
                <p className="font-medium text-slate-900">{new Date(issue.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Returned</p>
                <p className="font-medium text-slate-900">{issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Renewals</p>
                <p className="font-medium text-slate-900">{issue.renewal_count ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Fine History</h3>
            <FineTable fines={issue.fines ?? []} />
          </div>
        </Card>
      </div>

      <ReturnIssueModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        issue={issue}
        onSubmit={handleReturn}
        isLoading={isSubmitting}
      />
      <RenewIssueModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        issue={issue}
        onSubmit={handleRenew}
        isLoading={isSubmitting}
      />
    </div>
  );
}
