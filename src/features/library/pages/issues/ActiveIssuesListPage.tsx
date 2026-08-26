import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { useToast } from '../../../../hooks/useToast';
import { getIssues, returnIssue, renewIssue } from '../../api/issues.api';
import type { BookIssue, BookIssueReturnData, BookIssueRenewData, IssueStatus } from '../../types/library.types';
import { getIssueErrorMessage } from '../../utils/issueErrors';
import IssueTable from '../../components/issues/IssueTable';
import ReturnIssueModal from '../../components/issues/ReturnIssueModal';
import RenewIssueModal from '../../components/issues/RenewIssueModal';
import IssuesTabs from '../../components/issues/IssuesTabs';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'issued', label: 'Issued' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'returned', label: 'Returned' },
];

export default function ActiveIssuesListPage() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [statusFilter]);

  async function loadIssues() {
    try {
      setLoading(true);
      const data = await getIssues(statusFilter || undefined);
      setIssues(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getIssueErrorMessage(err, 'Failed to load issues'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReturnIssue(issueId: number, data: BookIssueReturnData) {
    setIsSubmitting(true);
    try {
      const result = await returnIssue(issueId, data);
      await loadIssues();
      setIsReturnModalOpen(false);
      setSelectedIssue(null);
      if (result.fine) {
        toast.success(`Returned. Fine of ₹${result.fine.amount} created.`);
      } else {
        toast.success('Returned. No fine.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRenewIssue(issueId: number, data: BookIssueRenewData) {
    setIsSubmitting(true);
    try {
      await renewIssue(issueId, data);
      await loadIssues();
      setIsRenewModalOpen(false);
      setSelectedIssue(null);
      toast.success('Issue renewed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReturnClick(issue: BookIssue) {
    setSelectedIssue(issue);
    setIsReturnModalOpen(true);
  }

  function handleRenewClick(issue: BookIssue) {
    setSelectedIssue(issue);
    setIsRenewModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Issues</h1>
          <p className="text-slate-600 mt-1">Manage book issues, returns, and renewals</p>
        </div>
        <Link to="/library/issues/desk">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Issue Book
          </Button>
        </Link>
      </div>

      <IssuesTabs />

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
              options={STATUS_OPTIONS}
              className="w-48"
            />
            <span className="text-sm text-slate-600">{issues.length} issue(s)</span>
          </div>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <IssueTable issues={issues} onReturn={handleReturnClick} onRenew={handleRenewClick} />
          )}
        </div>
      </Card>

      <ReturnIssueModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        issue={selectedIssue}
        onSubmit={handleReturnIssue}
        isLoading={isSubmitting}
      />
      <RenewIssueModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        issue={selectedIssue}
        onSubmit={handleRenewIssue}
        isLoading={isSubmitting}
      />
    </div>
  );
}
