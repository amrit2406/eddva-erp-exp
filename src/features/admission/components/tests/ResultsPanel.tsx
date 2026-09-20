import { useEffect, useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getTestResults, submitTestResults } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { percentOf, registrationLabel } from '../../utils/tests';
import type { EntranceTest, TestRegistration, TestResult, TestResultEntry } from '../../types/admission.types';

interface ResultsPanelProps {
  test: EntranceTest;
  registrations: TestRegistration[];
  canUpdate: boolean;
}

export default function ResultsPanel({ test, registrations, canUpdate }: ResultsPanelProps) {
  const { toast } = useToast();
  const maxMarks = Number(test.max_marks);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Only what the user has typed; everything else shows the saved marks.
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTestResults(test.test_id)
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load results'));
      });
    return () => {
      cancelled = true;
    };
  }, [test.test_id, reloadKey]);

  const saved = new Map((results ?? []).map((result) => [result.application_id, Number(result.marks_obtained)]));

  // Candidates who sat the test, plus anyone who already has a mark on record.
  const rows = registrations.filter(
    (registration) => registration.status === 'appeared' || saved.has(registration.application_id)
  );

  const valueFor = (applicationId: number): string =>
    edits[applicationId] ?? (saved.has(applicationId) ? String(saved.get(applicationId)) : '');

  const isInvalid = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (trimmed === '') return false;
    const value = Number(trimmed);
    return Number.isNaN(value) || value < 0 || value > maxMarks;
  };

  const entries: TestResultEntry[] = Object.entries(edits).flatMap(([id, raw]) => {
    const trimmed = raw.trim();
    if (trimmed === '' || isInvalid(trimmed)) return [];
    const applicationId = Number(id);
    const marks = Number(trimmed);
    return saved.get(applicationId) === marks ? [] : [{ application_id: applicationId, marks_obtained: marks }];
  });
  const hasInvalid = Object.values(edits).some(isInvalid);

  const handleSave = async () => {
    try {
      setSaving(true);
      await submitTestResults(test.test_id, entries);
      toast.success('Results saved');
      setEdits({});
      setReloadKey((key) => key + 1);
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to save results'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Results</h2>
            <p className="text-sm text-slate-500 mt-0.5">Marks out of {maxMarks}</p>
          </div>
          {canUpdate && rows.length > 0 && (
            <Button variant="primary" size="sm" disabled={saving || hasInvalid || entries.length === 0} onClick={handleSave}>
              {saving ? 'Saving...' : `Save Results${entries.length ? ` (${entries.length})` : ''}`}
            </Button>
          )}
        </div>

        {loadError ? (
          <div className="text-center text-red-500 py-4">{loadError}</div>
        ) : results === null ? (
          <div className="text-center text-slate-500 py-4">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-slate-500 py-4">
            Mark registered applications as appeared to enter their marks.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((registration) => {
              const value = valueFor(registration.application_id);
              const invalid = isInvalid(value);
              return (
                <li key={registration.registration_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{registrationLabel(registration)}</div>
                    <div className="text-xs text-slate-500">Application #{registration.application_id}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canUpdate ? (
                      <input
                        type="number"
                        min={0}
                        max={maxMarks}
                        step="any"
                        value={value}
                        aria-label={`Marks for ${registrationLabel(registration)}`}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [registration.application_id]: e.target.value }))}
                        className={`w-24 px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:border-transparent ${
                          invalid ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-[#008BE9]'
                        }`}
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{value || '—'}</span>
                    )}
                    <span className="text-sm text-slate-500 w-20">
                      / {maxMarks}
                      {value && !invalid && <span className="ml-1 text-slate-400">{percentOf(value, maxMarks)}</span>}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {hasInvalid && (
          <p className="text-sm text-red-600">Marks must be between 0 and {maxMarks}.</p>
        )}
      </div>
    </Card>
  );
}
