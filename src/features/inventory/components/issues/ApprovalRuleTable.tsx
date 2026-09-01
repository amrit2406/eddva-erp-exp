import { Folder } from 'lucide-react';
import type { InventoryApprovalRule } from '../../types/issue.types';
import { cn } from '../../../../utils/cn';

interface ApprovalRuleTableProps {
  rules: InventoryApprovalRule[];
  className?: string;
}

export default function ApprovalRuleTable({ rules, className }: ApprovalRuleTableProps) {
  const rulesArray = Array.isArray(rules) ? rules : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Value Threshold</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Quantity Threshold</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {rulesArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No approval rules configured.
              </td>
            </tr>
          ) : (
            rulesArray.map((rule) => (
              <tr key={rule.rule_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-900">
                  {rule.category ? (
                    <span className="inline-flex items-center gap-1">
                      <Folder className="h-3.5 w-3.5 text-slate-400" />
                      {rule.category.name}
                    </span>
                  ) : (
                    <span className="font-medium">All Categories (Global)</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {rule.value_threshold != null ? `₹${rule.value_threshold}` : '—'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{rule.quantity_threshold ?? '—'}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      rule.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
