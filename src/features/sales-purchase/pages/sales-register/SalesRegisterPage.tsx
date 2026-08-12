import { FileText, DollarSign, TrendingUp } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import SalesRegisterTable from '../../components/sales-register/SalesRegisterTable';
import SalesRegisterFilters from '../../components/sales-register/SalesRegisterFilters';

export default function SalesRegisterPage() {
  // Calculate totals from mock data
  const totalTaxable = 110000;
  const totalTax = 19800;
  const totalGrand = 128550;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Register</h1>
          <p className="text-slate-600 mt-1">Statutory report of posted customer invoices</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Taxable</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalTaxable.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tax</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalTax.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Grand Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalGrand.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <SalesRegisterFilters />
          <div className="mt-4">
            <SalesRegisterTable />
          </div>
        </div>
      </Card>
    </div>
  );
}
