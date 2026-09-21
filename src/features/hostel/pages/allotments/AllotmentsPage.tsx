import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getAllotments } from '../../api/hostel.api';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/hostel.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'allotment_id');
  return id ? `/hostel/allotments/${id}` : undefined;
};

export default function AllotmentsPage() {
  const [yearInput, setYearInput] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setAcademicYear(yearInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [yearInput]);

  const load = useCallback(
    (params: ListParams) => getAllotments({ ...params, academic_year: academicYear }),
    [academicYear]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Allotments</h1>
        <p className="text-slate-600 mt-1">Which resident holds which bed. New allotments are made from a resident's page.</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Academic year, e.g. 2026-27"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

        <RecordPanel key={academicYear} load={load} emptyMessage="No allotments found" rowHref={rowHref} />
      </Card>
    </div>
  );
}
