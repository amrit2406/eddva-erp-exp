import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Send, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import RecordPanel from '../../components/common/RecordPanel';
import {
  deleteNewsletter,
  getNewsletter,
  getNewsletterStats,
  getPreviewRecipients,
  sendNewsletter,
} from '../../api/newsletters.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';
import type { ListParams } from '../../types/profile.types';
import type { Newsletter } from '../../types/newsletters.types';

type Tab = 'recipients' | 'stats';

const TABS: { key: Tab; label: string }[] = [
  { key: 'recipients', label: 'Recipients Preview' },
  { key: 'stats', label: 'Stats' },
];

const CHANNEL_OPTIONS = ['email', 'sms'];

export default function NewsletterDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('newsletters');
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('recipients');
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [channels, setChannels] = useState<string[]>(['email']);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getNewsletter(id)
      .then((data) => {
        if (!cancelled) setNewsletter(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load newsletter'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadRecipients = useCallback((params: ListParams) => getPreviewRecipients(id!, params), [id]);
  const loadStats = useCallback(() => getNewsletterStats(id!), [id]);

  const toggleChannel = (channel: string) => {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || channels.length === 0) return;
    try {
      setSending(true);
      setSendError(null);
      await sendNewsletter(id, channels);
      toast.success('Newsletter sent');
      setSendModalOpen(false);
    } catch (err) {
      setSendError(getApiErrorMessage(err, 'Failed to send newsletter'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !newsletter || !window.confirm(`Delete newsletter "${newsletter.title}"?`)) return;
    try {
      await deleteNewsletter(id);
      toast.success('Newsletter deleted');
      navigate('/alumni/newsletters');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete newsletter'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!newsletter) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const isSent = newsletter.status?.toLowerCase() === 'sent';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/newsletters" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to newsletters
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{newsletter.title}</h1>
            {newsletter.status && <p className="text-slate-600 mt-1 capitalize">{newsletter.status}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {!isSent && can('send') && (
              <Button variant="primary" onClick={() => setSendModalOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            )}
            {!isSent && can('update') && (
              <Link to={`/alumni/newsletters/${newsletter.newsletter_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {!isSent && (can('delete') || can('update')) && (
              <Button variant="ghost" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </Button>
            )}
          </div>
        </div>
        <p className="text-slate-600 mt-3 max-w-3xl whitespace-pre-wrap">{newsletter.content}</p>
      </div>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'recipients' && (
          <RecordPanel key="recipients" load={loadRecipients} emptyMessage="No alumni match this newsletter's audience" />
        )}
        {tab === 'stats' && <RecordPanel key="stats" load={loadStats} emptyMessage="No stats available yet" />}
      </Card>

      <Modal isOpen={sendModalOpen} onClose={() => !sending && setSendModalOpen(false)} title="Send Newsletter">
        <form onSubmit={handleSend} className="space-y-4">
          {sendError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{sendError}</div>
          )}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Channels *</span>
            <div className="flex gap-4">
              {CHANNEL_OPTIONS.map((channel) => (
                <label key={channel} className="flex items-center gap-2 text-sm font-medium text-slate-700 capitalize">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={() => toggleChannel(channel)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {channel}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setSendModalOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={sending || channels.length === 0}>
              {sending ? 'Sending...' : 'Send Now'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
