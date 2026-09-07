import { Link } from 'react-router-dom';
import { Edit, Building2 } from 'lucide-react';
import type { CostCenter } from '../../types/costCenter.types';
import { cn } from '../../../../utils/cn';

interface CostCenterTableProps {
  costCenters: CostCenter[];
  className?: string;
}

export default function CostCenterTable({ costCenters, className }: CostCenterTableProps) {
  const costCentersArray = Array.isArray(costCenters) ? costCenters : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {costCentersArray.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-slate-500">
                No cost centers found. Add your first cost center.
              </td>
            </tr>
          ) : (
            costCentersArray.map((costCenter) => (
              <tr key={costCenter.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{costCenter.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      costCenter.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {costCenter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/accounts/cost-centers/${costCenter.id}/edit`}>
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
