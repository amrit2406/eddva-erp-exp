import type { MeritEntry, MeritEntryDraft, MeritEntryPayload, MeritList } from '../types/admission.types';

// RBAC resource the merit-list endpoints are checked against.
export const MERIT_LISTS_RESOURCE = 'merit_lists';

export const CATEGORY_SUGGESTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export function isPublished(list: MeritList): boolean {
  return list.status === 'published' || !!list.published_at;
}

export function entryCount(list: MeritList): number | undefined {
  return list.entries?.length ?? list._count?.entries;
}

export function toDrafts(entries: MeritEntry[] = []): MeritEntryDraft[] {
  return [...entries]
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => ({
      application_id: entry.application_id,
      name: entry.application?.applicant?.name ?? `Application #${entry.application_id}`,
      rank: entry.rank,
      category: entry.category ?? '',
      outcome: entry.outcome,
    }));
}

// Best rank first. Blank ranks (invalid anyway) sink to the bottom.
export function sortDrafts(drafts: MeritEntryDraft[]): MeritEntryDraft[] {
  const key = (draft: MeritEntryDraft) => (draft.rank === '' ? Number.POSITIVE_INFINITY : draft.rank);
  return [...drafts].sort((a, b) => key(a) - key(b));
}

export function toPayloadEntries(drafts: MeritEntryDraft[]): MeritEntryPayload[] {
  return sortDrafts(drafts).map((draft) => {
    const category = draft.category.trim();
    return {
      application_id: draft.application_id,
      rank: Number(draft.rank),
      ...(category && { category }),
      outcome: draft.outcome,
    };
  });
}

export function validateDrafts(drafts: MeritEntryDraft[]): string | null {
  const bad = drafts.find((draft) => draft.rank === '' || !Number.isInteger(draft.rank) || draft.rank < 1);
  return bad ? `Give ${bad.name} a whole-number rank of 1 or more.` : null;
}

// Stable string for "have the entries changed?" checks.
export function draftsSignature(drafts: MeritEntryDraft[]): string {
  return JSON.stringify(toPayloadEntries(drafts.filter((draft) => draft.rank !== '')));
}
