import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { RecommendationBadge } from './InterviewBadges';
import { evaluateInterview } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatLabel } from '../../utils/format';
import { getEvaluation } from '../../utils/interviews';
import {
  INTERVIEW_RECOMMENDATIONS,
  type EvaluationFormData,
  type Interview,
  type InterviewRecommendation,
} from '../../types/admission.types';

interface EvaluationPanelProps {
  interview: Interview;
  canUpdate: boolean;
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function EvaluationPanel({ interview, canUpdate, onChanged }: EvaluationPanelProps) {
  const { toast } = useToast();
  const evaluation = getEvaluation(interview);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EvaluationFormData>({ score: '', remarks: '', recommendation: 'recommend' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setForm({
      score: evaluation?.score === null || evaluation?.score === undefined || evaluation?.score === '' ? '' : Number(evaluation.score),
      remarks: evaluation?.remarks ?? '',
      recommendation: evaluation?.recommendation ?? 'recommend',
    });
    setError(null);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await evaluateInterview(interview.interview_id, form);
      toast.success('Evaluation saved');
      setEditing(false);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to save evaluation'));
    } finally {
      setSaving(false);
    }
  };

  // No evaluation yet and the user can write: go straight to the form.
  const formOpen = canUpdate && (editing || !evaluation);

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Evaluation</h2>
          {canUpdate && evaluation && !editing && (
            <Button variant="ghost" size="sm" title="Edit evaluation" onClick={startEditing}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>

        {formOpen ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eval_score" className={labelClass}>Score *</label>
                <input
                  id="eval_score"
                  type="number"
                  min={0}
                  step="any"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="82.5"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="eval_recommendation" className={labelClass}>Recommendation *</label>
                <select
                  id="eval_recommendation"
                  value={form.recommendation}
                  onChange={(e) => setForm({ ...form, recommendation: e.target.value as InterviewRecommendation })}
                  className={`${inputClass} capitalize`}
                  required
                >
                  {INTERVIEW_RECOMMENDATIONS.map((option) => (
                    <option key={option} value={option}>{formatLabel(option)}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="eval_remarks" className={labelClass}>Remarks</label>
                <textarea
                  id="eval_remarks"
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="e.g. Confident, strong reasoning"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-3">
              {editing && (
                <Button type="button" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              )}
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : evaluation ? 'Update Evaluation' : 'Save Evaluation'}
              </Button>
            </div>
          </form>
        ) : evaluation ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold text-slate-900">
                {evaluation.score === null || evaluation.score === undefined || evaluation.score === '' ? '—' : Number(evaluation.score)}
              </span>
              {evaluation.recommendation && <RecommendationBadge recommendation={evaluation.recommendation} />}
            </div>
            {evaluation.remarks && (
              <p className="text-slate-700 whitespace-pre-wrap break-words">{evaluation.remarks}</p>
            )}
          </div>
        ) : (
          <div className="text-slate-500">Not evaluated yet</div>
        )}
      </div>
    </Card>
  );
}
