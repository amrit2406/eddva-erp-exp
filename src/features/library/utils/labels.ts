import type { LucideIcon } from 'lucide-react';
import { BookCheck, BookOpen, Clock, Hourglass, PackageCheck, TriangleAlert } from 'lucide-react';
import { toNumber } from '../../../utils/dashboardFormat';
import type { BookIssue, Fine, MembershipRule } from '../types/library.types';

export interface Tag {
  label: string;
  color: string;
}

const humanWords = (value: string) => {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};
const pick = (map: Record<string, Tag>, key?: string | null): Tag => (key && map[key]) || { label: key ? humanWords(key) : '—', color: '#64748b' };

export const MEMBER_TYPE: Record<string, Tag> = {
  student: { label: 'Student', color: '#008BE9' },
  staff: { label: 'Staff', color: '#0891b2' },
  faculty: { label: 'Faculty', color: '#7c3aed' },
};
export const memberTypeInfo = (type?: string | null) => pick(MEMBER_TYPE, type);

const PLURAL: Record<string, string> = { student: 'Students', staff: 'Staff', faculty: 'Faculty' };
// "Students" / "Staff" / "Faculty" — for headings and sentences about a whole group.
export const memberTypePlural = (type?: string | null) => (type && PLURAL[type]) || `${memberTypeInfo(type).label}s`;

export const MEMBER_STATUS: Record<string, Tag> = {
  active: { label: 'Active', color: '#15936a' },
  suspended: { label: 'Suspended', color: '#d03b3b' },
  expired: { label: 'Expired', color: '#94a3b8' },
};
export const memberStatusInfo = (status?: string | null) => pick(MEMBER_STATUS, status);

// Where a physical copy is right now, in shelf words.
export const COPY_STATUS: Record<string, Tag> = {
  available: { label: 'On the shelf', color: '#15936a' },
  issued: { label: 'Lent out', color: '#008BE9' },
  reserved: { label: 'Kept aside', color: '#7c3aed' },
  under_repair: { label: 'Being repaired', color: '#c98500' },
  lost: { label: 'Lost', color: '#d03b3b' },
  withdrawn: { label: 'Removed', color: '#94a3b8' },
};
export const copyStatusInfo = (status?: string | null) => pick(COPY_STATUS, status);
// Statuses staff may set by hand; "Lent out" only comes from lending.
export const SETTABLE_COPY_STATUSES = ['available', 'reserved', 'under_repair', 'lost', 'withdrawn'] as const;

export const CONDITION: Record<string, Tag> = {
  new: { label: 'New', color: '#15936a' },
  good: { label: 'Good', color: '#008BE9' },
  worn: { label: 'Worn', color: '#c98500' },
  damaged: { label: 'Damaged', color: '#d03b3b' },
};
export const conditionInfo = (condition?: string | null) => pick(CONDITION, condition);

export const RESERVATION_STATUS: Record<string, Tag & { hint: string }> = {
  pending: { label: 'Waiting', color: '#c98500', hint: 'Waiting for a copy to come back' },
  ready_for_pickup: { label: 'Ready to collect', color: '#7c3aed', hint: 'A copy is kept aside for the member' },
  fulfilled: { label: 'Collected', color: '#15936a', hint: 'The member got the book' },
  cancelled: { label: 'Cancelled', color: '#94a3b8', hint: 'No longer needed' },
  expired: { label: 'Expired', color: '#94a3b8', hint: 'Not collected in time' },
};
export const reservationStatusInfo = (status?: string | null) => RESERVATION_STATUS[status ?? ''] ?? { ...pick({}, status), hint: '' };
export const canCancelReservation = (status: string) => status === 'pending' || status === 'ready_for_pickup';

export const FINE_STATUS: Record<string, Tag> = {
  pending: { label: 'Not paid', color: '#d03b3b' },
  partially_paid: { label: 'Part paid', color: '#c98500' },
  paid: { label: 'Paid', color: '#15936a' },
  waived: { label: 'Waived', color: '#94a3b8' },
};
export const fineStatusInfo = (status?: string | null) => pick(FINE_STATUS, status);

export const FINE_REASON: Record<string, string> = {
  overdue: 'Returned late',
  lost_book: 'Book lost',
  damaged_book: 'Book damaged',
};

export const PAYMENT_MODE: Record<string, string> = { cash: 'Cash', upi: 'UPI', card: 'Card' };

export function finePaid(fine: Fine): number {
  return (fine.payments ?? []).reduce((sum, p) => sum + toNumber(p.amount_paid), 0);
}

export function fineLeft(fine: Fine): number {
  if (fine.status === 'paid' || fine.status === 'waived') return 0;
  return Math.max(0, Math.round((toNumber(fine.amount) - finePaid(fine)) * 100) / 100);
}

// Whole days between two dates, ignoring the time of day.
function dayNumber(value: string | Date): number {
  const d = new Date(value);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
export const daysBetween = (from: string | Date, to: string | Date) => dayNumber(to) - dayNumber(from);

export type LoanState = 'returned' | 'overdue' | 'due_soon' | 'on_loan' | 'lost';

export const LOAN_STATE: Record<LoanState, Tag & { icon: LucideIcon }> = {
  on_loan: { label: 'On loan', color: '#008BE9', icon: BookOpen },
  due_soon: { label: 'Due soon', color: '#c98500', icon: Hourglass },
  overdue: { label: 'Overdue', color: '#d03b3b', icon: TriangleAlert },
  returned: { label: 'Returned', color: '#15936a', icon: BookCheck },
  lost: { label: 'Lost', color: '#94a3b8', icon: PackageCheck },
};

// The overdue flag is set by a nightly job, so also trust the due date itself.
export function loanState(issue: Pick<BookIssue, 'status' | 'due_date'>, today: Date): LoanState {
  if (issue.status === 'returned') return 'returned';
  if (issue.status === 'lost') return 'lost';
  const left = daysBetween(today, issue.due_date);
  if (issue.status === 'overdue' || left < 0) return 'overdue';
  if (left <= 2) return 'due_soon';
  return 'on_loan';
}

export const isOut = (issue: Pick<BookIssue, 'status'>) => issue.status === 'issued' || issue.status === 'overdue';

// "Due today" / "Due in 3 days" / "5 days late" / "Returned 2 Sept".
export function dueText(issue: Pick<BookIssue, 'status' | 'due_date' | 'return_date'>, today: Date): string {
  if (issue.status === 'returned') return issue.return_date ? `Returned ${shortDay(issue.return_date)}` : 'Returned';
  const left = daysBetween(today, issue.due_date);
  if (left === 0) return 'Due today';
  if (left === 1) return 'Due tomorrow';
  if (left > 1) return `Due in ${left} days`;
  return `${-left} day${left === -1 ? '' : 's'} late`;
}

// What the fine would be if the book came back today (same rule as the backend).
export function fineIfReturnedToday(issue: Pick<BookIssue, 'status' | 'due_date' | 'fine_per_day' | 'grace_period_days' | 'max_fine_cap'>, today: Date): number {
  if (!isOut(issue)) return 0;
  const late = Math.max(0, daysBetween(issue.due_date, today) - (issue.grace_period_days ?? 0));
  const raw = late * toNumber(issue.fine_per_day);
  const cap = issue.max_fine_cap === null || issue.max_fine_cap === undefined ? null : toNumber(issue.max_fine_cap);
  return cap !== null && cap > 0 && raw > cap ? cap : raw;
}

// The backend allows two renewals per loan (LIBRARY_MAX_RENEWALS).
export const MAX_RENEWALS = 2;

// "Students borrow up to 2 books for 14 days…"
export function ruleSentence(rule: Pick<MembershipRule, 'member_type' | 'max_books_allowed' | 'loan_period_days' | 'fine_per_day' | 'grace_period_days' | 'max_fine_cap'>): string {
  const who = memberTypePlural(rule.member_type);
  const fine = toNumber(rule.fine_per_day);
  const cap = rule.max_fine_cap === null ? 0 : toNumber(rule.max_fine_cap);
  const books = `${rule.max_books_allowed} book${rule.max_books_allowed === 1 ? '' : 's'}`;
  const late =
    fine > 0
      ? ` Late returns cost ₹${fine} a day${rule.grace_period_days ? ` after ${rule.grace_period_days} free day${rule.grace_period_days === 1 ? '' : 's'}` : ''}${cap > 0 ? `, up to ₹${cap}` : ''}.`
      : ' No late fine.';
  return `${who} can borrow up to ${books} at a time for ${rule.loan_period_days} days.${late}`;
}

export const shortDay = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—');

export const LOAN_STEP_ICON = { issued: BookOpen, due: Clock, returned: BookCheck };
