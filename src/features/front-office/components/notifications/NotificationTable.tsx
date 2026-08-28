import { Mail, MessageSquare, Bell as BellIcon, User } from 'lucide-react';
import type { FrontOfficeNotification, NotificationChannel, NotificationStatus } from '../../types/notification.types';
import { cn } from '../../../../utils/cn';

interface NotificationTableProps {
  notifications: FrontOfficeNotification[];
  className?: string;
}

const CHANNEL_ICON: Record<NotificationChannel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: BellIcon,
};

const STATUS_STYLE: Record<NotificationStatus, string> = {
  queued: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const ENTITY_STYLE: Record<string, string> = {
  visitor: 'bg-purple-100 text-purple-700',
  enquiry: 'bg-amber-100 text-amber-700',
  appointment: 'bg-blue-100 text-blue-700',
  complaint: 'bg-red-100 text-red-700',
};

export default function NotificationTable({ notifications, className }: NotificationTableProps) {
  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Entity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Event</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Recipient</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Channel</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Sent</th>
          </tr>
        </thead>
        <tbody>
          {notificationsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No notifications found.
              </td>
            </tr>
          ) : (
            notificationsArray.map((n) => {
              const ChannelIcon = CHANNEL_ICON[n.channel] ?? Mail;
              return (
                <tr key={n.notification_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', ENTITY_STYLE[n.entity_type] ?? 'bg-slate-100 text-slate-600')}>
                      {n.entity_type} #{n.entity_id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-slate-900">{n.event_type}</div>
                    {n.message && <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{n.message}</div>}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {n.recipient ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {n.recipient.name}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1 capitalize">
                      <ChannelIcon className="h-3.5 w-3.5 text-slate-400" />
                      {n.channel}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize', STATUS_STYLE[n.status])}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {n.sent_at ? new Date(n.sent_at).toLocaleString() : new Date(n.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
