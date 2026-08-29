import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import EmptyState from '../../../../components/ui/EmptyState';
import { useToast } from '../../../../hooks/useToast';
import { getUpcomingFollowups, getOverdueFollowups } from '../../api/enquiries.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FollowupWithEnquiry } from '../../types/enquiryRecord.types';
import { cn } from '../../../../utils/cn';

type Tab = 'upcoming' | 'overdue';

export default function FollowupsDashboardPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [followups, setFollowups] = useState<FollowupWithEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    try {
      setLoading(true);
      const data = tab === 'upcoming' ? await getUpcomingFollowups() : await getOverdueFollowups();
      setFollowups(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load follow-ups'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/front-office/enquiries" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Enquiries
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
        <p className="text-slate-600 mt-1">Enquiries due for a follow-up</p>
      </div>

      <div className="flex gap-1 text-sm bg-slate-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={cn('px-4 py-2 rounded-md flex items-center gap-1.5', tab === 'upcoming' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
        >
          <Clock className="h-3.5 w-3.5" />
          Upcoming
        </button>
        <button
          onClick={() => setTab('overdue')}
          className={cn('px-4 py-2 rounded-md flex items-center gap-1.5', tab === 'overdue' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500')}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Overdue
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : followups.length === 0 ? (
        <Card className="border-slate-200">
          <EmptyState
            icon={tab === 'upcoming' ? Clock : AlertTriangle}
            title={tab === 'upcoming' ? 'No upcoming follow-ups' : 'No overdue follow-ups'}
            description={tab === 'upcoming' ? 'Nothing due in the next 7 days.' : 'All follow-ups are on schedule.'}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {followups.map((f) => (
            <Link key={f.followup_id} to={`/front-office/enquiries/${f.enquiry_id}`}>
              <Card
                className={cn('border-slate-200 hover:bg-slate-50 transition-colors', tab === 'overdue' && 'border-red-200 bg-red-50 hover:bg-red-100')}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{f.enquiry?.enquirer_name ?? `Enquiry #${f.enquiry_id}`}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{f.notes}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-sm font-medium', tab === 'overdue' ? 'text-red-700' : 'text-slate-700')}>
                      {f.next_followup_date ? new Date(f.next_followup_date).toLocaleDateString() : '—'}
                    </p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{f.enquiry?.status.replace('_', ' ')}</p>
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
