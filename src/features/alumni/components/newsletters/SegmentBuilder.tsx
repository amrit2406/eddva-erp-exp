import { useEffect, useState } from 'react';
import { getGroups } from '../../api/groups.api';
import type { AlumniGroup } from '../../types/engagement.types';
import type { TargetSegment } from '../../types/newsletters.types';

interface SegmentBuilderProps {
  value: TargetSegment;
  onChange: (value: TargetSegment) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function parseNumbers(text: string): number[] {
  return text
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => !Number.isNaN(n));
}

function parseStrings(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

// Filters that narrow a newsletter's audience. "All Alumni" is sent alongside
// the rest — presumably the backend ignores the other filters when it's set.
export default function SegmentBuilder({ value, onChange }: SegmentBuilderProps) {
  const [groups, setGroups] = useState<AlumniGroup[]>([]);
  const [text, setText] = useState({
    batch_years: value.batch_years.join(', '),
    graduation_years: value.graduation_years.join(', '),
    programs: value.programs.join(', '),
    cities: value.cities.join(', '),
    countries: value.countries.join(', '),
    industries: value.industries.join(', '),
    companies: value.companies.join(', '),
  });

  useEffect(() => {
    getGroups({ limit: 200 })
      .then((result) => setGroups(result.data))
      .catch(() => setGroups([]));
  }, []);

  const setNumberField = (field: 'batch_years' | 'graduation_years', raw: string) => {
    setText((prev) => ({ ...prev, [field]: raw }));
    onChange({ ...value, [field]: parseNumbers(raw) });
  };

  const setStringField = (
    field: 'programs' | 'cities' | 'countries' | 'industries' | 'companies',
    raw: string
  ) => {
    setText((prev) => ({ ...prev, [field]: raw }));
    onChange({ ...value, [field]: parseStrings(raw) });
  };

  const toggleGroup = (groupId: number) => {
    const next = value.group_ids.includes(groupId)
      ? value.group_ids.filter((id) => id !== groupId)
      : [...value.group_ids, groupId];
    onChange({ ...value, group_ids: next });
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={value.all}
          onChange={(e) => onChange({ ...value, all: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        All alumni
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="segment_batch_years" className="block text-sm font-medium text-slate-700 mb-1">
            Batch Years
          </label>
          <input
            id="segment_batch_years"
            type="text"
            value={text.batch_years}
            onChange={(e) => setNumberField('batch_years', e.target.value)}
            placeholder="e.g. 2015, 2016"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="segment_graduation_years" className="block text-sm font-medium text-slate-700 mb-1">
            Graduation Years
          </label>
          <input
            id="segment_graduation_years"
            type="text"
            value={text.graduation_years}
            onChange={(e) => setNumberField('graduation_years', e.target.value)}
            placeholder="e.g. 2015"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="segment_programs" className="block text-sm font-medium text-slate-700 mb-1">
            Programs
          </label>
          <input
            id="segment_programs"
            type="text"
            value={text.programs}
            onChange={(e) => setStringField('programs', e.target.value)}
            placeholder="e.g. MBA"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="segment_cities" className="block text-sm font-medium text-slate-700 mb-1">
            Cities
          </label>
          <input
            id="segment_cities"
            type="text"
            value={text.cities}
            onChange={(e) => setStringField('cities', e.target.value)}
            placeholder="e.g. Bangalore"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="segment_countries" className="block text-sm font-medium text-slate-700 mb-1">
            Countries
          </label>
          <input
            id="segment_countries"
            type="text"
            value={text.countries}
            onChange={(e) => setStringField('countries', e.target.value)}
            placeholder="e.g. India"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="segment_industries" className="block text-sm font-medium text-slate-700 mb-1">
            Industries
          </label>
          <input
            id="segment_industries"
            type="text"
            value={text.industries}
            onChange={(e) => setStringField('industries', e.target.value)}
            placeholder="e.g. Technology"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="segment_companies" className="block text-sm font-medium text-slate-700 mb-1">
            Companies
          </label>
          <input
            id="segment_companies"
            type="text"
            value={text.companies}
            onChange={(e) => setStringField('companies', e.target.value)}
            placeholder="e.g. Acme Corp"
            className={inputClass}
          />
        </div>
      </div>

      {groups.length > 0 && (
        <div>
          <span className="block text-sm font-medium text-slate-700 mb-2">Groups</span>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const selected = value.group_ids.includes(group.group_id);
              return (
                <button
                  key={group.group_id}
                  type="button"
                  onClick={() => toggleGroup(group.group_id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    selected ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
