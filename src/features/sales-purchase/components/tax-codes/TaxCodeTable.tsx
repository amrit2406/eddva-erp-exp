import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { TaxCode } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface TaxCodeTableProps {
  taxCodes: TaxCode[];
  className?: string;
}

export default function TaxCodeTable({ taxCodes, className }: TaxCodeTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tax Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">CGST %</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">SGST %</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">IGST %</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Effective From</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {taxCodes.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No tax codes found. Create your first tax code.
              </td>
            </tr>
          ) : (
            taxCodes.map((taxCode) => (
              <tr key={taxCode.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{taxCode.name}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{taxCode.cgstPct}%</td>
                <td className="py-3 px-4 text-sm text-slate-600">{taxCode.sgstPct}%</td>
                <td className="py-3 px-4 text-sm text-slate-600">{taxCode.igstPct}%</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  {new Date(taxCode.effectiveFrom).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/tax-codes/${taxCode.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/tax-codes/${taxCode.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
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
