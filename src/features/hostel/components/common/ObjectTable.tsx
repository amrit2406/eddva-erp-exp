import { Link } from 'react-router-dom';
import { flattenRecord, formatValue, humanizeKey, isPrimitive } from '../../utils/format';
import type { GenericRecord } from '../../types/hostel.types';

interface ObjectTableProps {
  rows: GenericRecord[];
  emptyMessage: string;
  // When given, the first column links to the row's detail page.
  rowHref?: (row: GenericRecord) => string | undefined;
  // Adds a trailing actions column, e.g. a quick "check out" button.
  rowActions?: (row: GenericRecord) => React.ReactNode;
}

const MAX_COLUMNS = 8;
const HIDDEN_KEY = /(^id$|_id$|^institute|created_at|updated_at|deleted_at)/;
// Most useful fields first. A nested field such as resident_student_name
// ranks with student_name.
const PREFERRED_KEYS = [
  'pass_no',
  'student_name',
  'resident_name',
  'name',
  'admission_no',
  'room_number',
  'room_no',
  'bed_number',
  'requested_room_number',
  'requested_bed_number',
  'floor',
  'floor_number',
  'room_type',
  'capacity',
  'occupied',
  'vacant',
  'academic_year',
  'allotment_date',
  'transfer_date',
  'check_in_date',
  'pass_type',
  'destination',
  'requested_out_at',
  'expected_return_at',
  'actual_out_at',
  'actual_return_at',
  'status',
];

function preferredRank(key: string): number {
  const rank = PREFERRED_KEYS.findIndex((preferred) => key === preferred || key.endsWith(`_${preferred}`));
  return rank === -1 ? PREFERRED_KEYS.length : rank;
}

function pickColumns(rows: GenericRecord[]): string[] {
  const keys = new Set<string>();
  rows.slice(0, 25).forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (isPrimitive(value)) keys.add(key);
    });
  });
  const all = [...keys];
  const visible = all.filter((key) => !HIDDEN_KEY.test(key));
  const base = visible.length > 0 ? visible : all;
  // Array.prototype.sort is stable, so unranked keys keep the API's order.
  return [...base].sort((a, b) => preferredRank(a) - preferredRank(b)).slice(0, MAX_COLUMNS);
}

// Renders rows whose fields aren't known up front: picks the most useful
// scalar fields as columns.
export default function ObjectTable({ rows, emptyMessage, rowHref, rowActions }: ObjectTableProps) {
  if (rows.length === 0) {
    return <div className="p-8 text-center text-slate-500">{emptyMessage}</div>;
  }

  const flatRows = rows.map(flattenRecord);
  const columns = pickColumns(flatRows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => (
              <th key={column} className="text-left py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                {humanizeKey(column)}
              </th>
            ))}
            {rowActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {flatRows.map((row, index) => {
            const href = rowHref?.(rows[index]);
            return (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                {columns.map((column, columnIndex) => (
                  <td key={column} className="py-3 px-4 text-slate-600">
                    {columnIndex === 0 && href ? (
                      <Link to={href} className="font-medium text-slate-900 hover:text-[#008BE9]">
                        {formatValue(column, row[column])}
                      </Link>
                    ) : (
                      formatValue(column, row[column])
                    )}
                  </td>
                ))}
                {rowActions && <td className="py-3 px-4 text-right">{rowActions(rows[index])}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
