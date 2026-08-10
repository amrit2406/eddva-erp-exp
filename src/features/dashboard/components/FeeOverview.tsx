import Card from '../../../components/ui/Card';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function FeeOverview() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pending Fees</h3>
        <DollarSign className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Pending</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(45000)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Overdue</span>
          <span className="text-sm font-medium text-red-600">{formatCurrency(12000)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Due This Month</span>
          <span className="text-sm font-medium text-yellow-600">{formatCurrency(33000)}</span>
        </div>
      </div>
    </Card>
  );
}
