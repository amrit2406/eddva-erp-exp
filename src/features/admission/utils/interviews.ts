import type { Interview, InterviewEvaluation } from '../types/admission.types';

// RBAC resource the interview endpoints are checked against.
export const INTERVIEWS_RESOURCE = 'interviews';

export function interviewApplicantName(interview: Interview): string {
  return interview.application?.applicant?.name ?? `Application #${interview.application_id}`;
}

// The evaluation may come back nested or as flat fields on the interview.
export function getEvaluation(interview: Interview): InterviewEvaluation | null {
  const evaluation =
    interview.evaluation ??
    (interview.score !== undefined || interview.recommendation !== undefined || interview.remarks !== undefined
      ? { score: interview.score ?? null, remarks: interview.remarks ?? null, recommendation: interview.recommendation ?? null }
      : null);
  if (!evaluation) return null;
  const empty = (evaluation.score === null || evaluation.score === undefined || evaluation.score === '') &&
    !evaluation.remarks && !evaluation.recommendation;
  return empty ? null : evaluation;
}

export function isUrl(value?: string | null): boolean {
  return !!value && /^https?:\/\//i.test(value.trim());
}
