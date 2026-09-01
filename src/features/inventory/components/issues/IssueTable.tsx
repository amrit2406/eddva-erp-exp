import { Link } from 'react-router-dom';
import { Eye, Package, User, Check, X, RotateCcw } from 'lucide-react';
import type { InventoryIssue } from '../../types/issue.types';
import { cn } from '../../../../utils/cn';

interface IssueTableProps {
  issues: InventoryIssue[];
  className?: string;
  onApprove?: (issue: InventoryIssue) => void;
  onReject?: (issue: InventoryIssue) => void;
  onReturn?: (issue: InventoryIssue) => void;
}

const STATUS_STYLE: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-700',
  issued: 'bg-blue-100 text-blue-700',
  partially_returned: 'bg-purple-100 text-purple-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-200 text-slate-600',
};

const RETURNABLE_STATUSES = new Set(['issued', 'partially_returned', 'overdue']);

export default function IssueTable({ issues, className, onApprove, onReject, onReturn }: IssueTableProps) {
  const issuesArray = Array.isArray(issues) ? issues : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Issue Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Holder</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Qty</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {issuesArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No issues found.
              </td>
            </tr>
          ) : (
            issuesArray.map((issue) => (
              <tr key={issue.issue_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/issues/${issue.issue_id}`} className="flex items-center gap-2 hover:underline">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{issue.item?.name ?? `#${issue.item_id}`}</span>
                    {issue.asset_unit && <span className="text-xs text-slate-500 font-mono">{issue.asset_unit.asset_tag}</span>}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {issue.holder?.name ?? `#${issue.holder_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {issue.quantity_returned}/{issue.quantity}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      STATUS_STYLE[issue.status] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {issue.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {issue.status === 'pending_approval' && (
                      <>
                        <button
                          onClick={() => onApprove?.(issue)}
                          className="px-2.5 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-1"
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onReject?.(issue)}
                          className="px-2.5 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg inline-flex items-center gap-1"
                          title="Reject"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {RETURNABLE_STATUSES.has(issue.status) && (
                      <button
                        onClick={() => onReturn?.(issue)}
                        className="px-2.5 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-1"
                        title="Return"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Link to={`/inventory/issues/${issue.issue_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
