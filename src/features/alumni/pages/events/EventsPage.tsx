import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import EventStatusBadge from '../../components/events/EventStatusBadge';
import { getEvents } from '../../api/events.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { Pagination } from '../../types/profile.types';
import type { AlumniEvent } from '../../types/engagement.types';

const PAGE_SIZE = 20;

export default function EventsPage() {
  const { can, ready } = useResourceAccess('events');
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEvents({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setEvents(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load events'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Events</h1>
          <p className="text-slate-600 mt-1">Reunions, webinars and other alumni events</p>
        </div>
        {can('create') && (
          <Link to="/alumni/events/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Event</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">When</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Mode</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.event_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link to={`/alumni/events/${event.event_id}`} className="font-medium text-slate-900 hover:text-blue-600">
                            {event.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{event.event_type}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                          {formatValue('event_date', event.event_date)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell capitalize">{event.mode}</td>
                        <td className="py-3 px-4">
                          <EventStatusBadge status={event.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {can('update') && (
                              <Link to={`/alumni/events/${event.event_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
