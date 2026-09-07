import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Wallet, Landmark, Scale, FileBarChart, TrendingUp } from 'lucide-react';
import Card from '../../../../components/ui/Card';

const reports = [
  {
    path: '/accounts/reports/ledger',
    label: 'Ledger Report',
    description: 'Transaction history for a single ledger account',
    icon: BookOpen,
  },
  {
    path: '/accounts/reports/day-book',
    label: 'Day Book',
    description: 'All voucher entries for a date range',
    icon: Calendar,
  },
  {
    path: '/accounts/reports/cash-book',
    label: 'Cash Book',
    description: 'Cash account transactions for a date range',
    icon: Wallet,
  },
  {
    path: '/accounts/reports/bank-book',
    label: 'Bank Book',
    description: 'Bank account transactions for a date range',
    icon: Landmark,
  },
  {
    path: '/accounts/reports/trial-balance',
    label: 'Trial Balance',
    description: 'Account balances as of a given date, with PDF export',
    icon: Scale,
  },
  {
    path: '/accounts/reports/balance-sheet',
    label: 'Balance Sheet',
    description: 'Assets, liabilities, and equity as of a given date, with PDF export',
    icon: FileBarChart,
  },
  {
    path: '/accounts/reports/income-expenditure',
    label: 'Income & Expenditure',
    description: 'Income and expenditure summary with net surplus/deficit',
    icon: TrendingUp,
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600 mt-1">Financial reports and statements</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Link key={report.path} to={report.path}>
            <Card className="border-slate-200 h-full hover:border-[#008BE9] hover:shadow-sm transition-all">
              <div className="p-5">
                <div className="h-10 w-10 rounded-lg bg-[#008BE9]/10 flex items-center justify-center mb-3">
                  <report.icon className="h-5 w-5 text-[#008BE9]" />
                </div>
                <h3 className="font-semibold text-slate-900">{report.label}</h3>
                <p className="text-sm text-slate-600 mt-1">{report.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
