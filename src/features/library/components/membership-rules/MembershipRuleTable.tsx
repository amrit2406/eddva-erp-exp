import { Link } from 'react-router-dom';
import { Edit, BookOpen, Clock, Shield } from 'lucide-react';
import type { MembershipRule } from '../../types/library.types';
import { cn } from '../../../../utils/cn';
import { ROUTES } from '../../../../constants/routes';

interface MembershipRuleTableProps {
  rules: MembershipRule[];
  className?: string;
}

export default function MembershipRuleTable({ rules, className }: MembershipRuleTableProps) {
  const rulesArray = Array.isArray(rules) ? rules : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Member Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Max Books</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Loan Period</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Fine/Day</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Grace Period</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden xl:table-cell">Max Fine Cap</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rulesArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No membership rules found. Create your first rule.
              </td>
            </tr>
          ) : (
            rulesArray.map((rule) => (
              <tr key={rule.rule_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900 capitalize">
                      {rule.member_type}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{rule.max_books_allowed}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{rule.loan_period_days} days</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">₹</span>
                    <span>{rule.fine_per_day}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  <span>{rule.grace_period_days} days</span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden xl:table-cell">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">₹</span>
                    <span>{rule.max_fine_cap}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={ROUTES.LIBRARY_MEMBERSHIP_RULES_EDIT.replace(':id', rule.rule_id.toString())}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
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