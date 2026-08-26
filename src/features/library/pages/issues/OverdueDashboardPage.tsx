import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { useToast } from '../../../../hooks/useToast';
import { getOverdueIssues } from '../../api/issues.api';
import { getIssueErrorMessage } from '../../utils/issueErrors';
import IssuesTabs from '../../components/issues/IssuesTabs';
import type { IssueDetail } from '../../types/library.types';

function daysOverdue(dueDate: string): number {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function totalFine(issue: IssueDetail): number {
  return (issue.fines ?? []).reduce((sum, fine) => sum + Number(fine.amount ?? 0), 0);
}

export default function OverdueDashboardPage() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<IssueDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getOverdueIssues();
      setIssues(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getIssueErrorMessage(err, 'Failed to load overdue issues'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overdue Dashboard</h1>
        <p className="text-slate-600 mt-1">Books past their due date, with fines accrued so far</p>
      </div>

      <IssuesTabs />

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : issues.length === 0 ? (
        <Card className="border-slate-200">
          <EmptyState
            icon={AlertTriangle}
            title="No overdue books"
            description="All active loans are within their due date."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Link key={issue.issue_id} to={`/library/issues/${issue.issue_id}`}>
              <Card className="border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {issue.member?.name ?? `Member #${issue.member_id}`}
                        <span className="text-slate-500 font-normal"> — {issue.member?.library_card_number}</span>
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {issue.copy?.book?.title ?? issue.book_title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-red-700 flex items-center gap-1 justify-end">
                      <Clock className="h-3.5 w-3.5" />
                      {daysOverdue(issue.due_date)} day(s) overdue
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">Fine so far: ₹{totalFine(issue).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
