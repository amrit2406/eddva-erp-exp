import { useEffect, useState } from 'react';
import GenericDataView from './GenericDataView';
import PaginationBar from './PaginationBar';
import { getApiErrorMessage } from '../../utils/errors';
import type { GenericRecord, ListParams, Pagination, RecordResult } from '../../types/profile.types';

export type RecordLoader = (params: ListParams) => Promise<RecordResult>;

interface RecordPanelProps {
  // Must be stable between renders (wrap in useCallback), it drives refetching.
  load: RecordLoader;
  emptyMessage: string;
  pageSize?: number;
  rowHref?: (row: GenericRecord) => string | undefined;
}

export default function RecordPanel({ load, emptyMessage, pageSize = 20, rowHref }: RecordPanelProps) {
  const [result, setResult] = useState<RecordResult | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    load({ page, limit: pageSize })
      .then((next) => {
        if (cancelled) return;
        setResult(next);
        setPagination(next.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load data'));
      });
    return () => {
      cancelled = true;
    };
  }, [load, page, pageSize]);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!result) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <>
      <GenericDataView data={result.data} emptyMessage={emptyMessage} rowHref={rowHref} />
      {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
    </>
  );
}
