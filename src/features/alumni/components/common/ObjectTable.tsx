import { Link } from 'react-router-dom';
import { flattenRecord, formatValue, humanizeKey, isPrimitive } from '../../utils/format';
import type { GenericRecord } from '../../types/profile.types';

interface ObjectTableProps {
  rows: GenericRecord[];
  emptyMessage: string;
  // When given, the first column links to the row's detail page.
  rowHref?: (row: GenericRecord) => string | undefined;
}

const MAX_COLUMNS = 8;
const HIDDEN_KEY = /(^id$|_id$|^institute|created_at|updated_at|deleted_at|password)/;
const PREFERRED_KEYS = [
  'full_name',
  'name',
  'email',
  'batch_year',
  'graduation_year',
  'program',
  'current_company',
  'current_designation',
  'city',
  'country',
  'verification_status',
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
export default function ObjectTable({ rows, emptyMessage, rowHref }: ObjectTableProps) {
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
                      <Link to={href} className="font-medium text-slate-900 hover:text-blue-600">
                        {formatValue(column, row[column])}
                      </Link>
                    ) : (
                      formatValue(column, row[column])
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
