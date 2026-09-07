import { Link } from 'react-router-dom';
import { Edit, BookOpen, Wallet, Landmark } from 'lucide-react';
import type { LedgerAccount } from '../../types/coa.types';
import { cn } from '../../../../utils/cn';

interface LedgerAccountTableProps {
  accounts: LedgerAccount[];
  className?: string;
}

export default function LedgerAccountTable({ accounts, className }: LedgerAccountTableProps) {
  const accountsArray = Array.isArray(accounts) ? accounts : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Account Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Group</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Opening Balance</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Flags</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accountsArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No ledger accounts found. Add your first account.
              </td>
            </tr>
          ) : (
            accountsArray.map((account) => (
              <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-mono text-slate-900">{account.accountCode}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{account.accountName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {account.group?.groupName ?? `#${account.groupId}`}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  ₹{account.openingBalance} <span className="text-xs text-slate-400">{account.openingBalanceType}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {account.isCashAccount && (
                      <span title="Cash Account" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">
                        <Wallet className="h-3 w-3" /> Cash
                      </span>
                    )}
                    {account.isBankAccount && (
                      <span title="Bank Account" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">
                        <Landmark className="h-3 w-3" /> Bank
                      </span>
                    )}
                    {!account.isCashAccount && !account.isBankAccount && '—'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      account.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/accounts/coa/ledger-accounts/${account.id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
