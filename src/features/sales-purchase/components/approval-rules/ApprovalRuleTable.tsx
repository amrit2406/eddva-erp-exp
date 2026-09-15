import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { ApprovalRule } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface ApprovalRuleTableProps {
  rules: ApprovalRule[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function ApprovalRuleTable({ rules, className, onDelete }: ApprovalRuleTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rule Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount Range</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Approver Role</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Sequence</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No approval rules found. Create your first rule.
              </td>
            </tr>
          ) : (
            rules.map((rule) => (
              <tr key={rule.rule_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{rule.name}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {rule.min_amount ? Number(rule.min_amount).toLocaleString() : '0'}
                  {' - '}
                  {rule.max_amount ? Number(rule.max_amount).toLocaleString() : '∞'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {rule.approver_role?.name || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">{rule.sequence}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      rule.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/approval-rules/${rule.rule_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/approval-rules/${rule.rule_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(rule.rule_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
