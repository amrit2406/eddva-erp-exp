import type { LucideIcon } from 'lucide-react';
import { Ban, CheckCircle2, ChefHat, ClipboardList, PackageCheck } from 'lucide-react';

export interface StatusInfo {
  label: string;
  // What it means / what happens next, in everyday words.
  hint: string;
  icon: LucideIcon;
  color: string;
}

// Plain-language names for order statuses (distinct hues from the dashboard palette).
export const ORDER_STATUS: Record<string, StatusInfo> = {
  PLACED: { label: 'New', hint: 'Order taken — not started yet', icon: ClipboardList, color: '#008BE9' },
  PREPARING: { label: 'Being made', hint: 'The kitchen is preparing it', icon: ChefHat, color: '#c98500' },
  READY: { label: 'Ready', hint: 'Waiting to be collected', icon: PackageCheck, color: '#7c3aed' },
  COMPLETED: { label: 'Collected', hint: 'Handed over to the member', icon: CheckCircle2, color: '#15936a' },
  CANCELLED: { label: 'Cancelled', hint: 'Stopped — nothing to serve', icon: Ban, color: '#94a3b8' },
};

export const ORDER_FLOW = ['PLACED', 'PREPARING', 'READY', 'COMPLETED'] as const;
export const ORDER_EXITS = ['CANCELLED'] as const;

export function orderStatusInfo(status: string): StatusInfo {
  return ORDER_STATUS[status] ?? { label: humanWords(status), hint: '', icon: ClipboardList, color: '#64748b' };
}

// The one button that moves an order forward, worded as the action.
export const NEXT_ORDER_STEP: Record<string, { status: string; label: string }> = {
  PLACED: { status: 'PREPARING', label: 'Start preparing' },
  PREPARING: { status: 'READY', label: 'Mark as ready' },
  READY: { status: 'COMPLETED', label: 'Mark as collected' },
};

// Items and member can only change before the kitchen finishes.
export const isOrderOpen = (status: string) => status === 'PLACED' || status === 'PREPARING';

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Paid', color: '#15936a' },
  PARTIAL: { label: 'Part paid', color: '#c98500' },
  PARTIALLY_PAID: { label: 'Part paid', color: '#c98500' },
  UNPAID: { label: 'Not paid', color: '#d03b3b' },
  REFUNDED: { label: 'Refunded', color: '#64748b' },
};

export function paymentStatusInfo(status?: string | null): { label: string; color: string } {
  if (!status) return PAYMENT_STATUS.UNPAID;
  return PAYMENT_STATUS[status] ?? { label: humanWords(status), color: '#64748b' };
}

export const FOOD_TYPE: Record<string, { label: string; color: string }> = {
  VEG: { label: 'Veg', color: '#15936a' },
  NON_VEG: { label: 'Non-veg', color: '#d03b3b' },
  EGG: { label: 'Egg', color: '#c98500' },
};

export const foodTypeInfo = (type: string) => FOOD_TYPE[type] ?? { label: humanWords(type), color: '#64748b' };

export const MEMBER_TYPE: Record<string, { label: string; color: string }> = {
  STUDENT: { label: 'Student', color: '#008BE9' },
  TEACHER: { label: 'Teacher', color: '#7c3aed' },
  STAFF: { label: 'Staff', color: '#0891b2' },
  GUEST: { label: 'Guest', color: '#c98500' },
};

export const memberTypeInfo = (type: string) => MEMBER_TYPE[type] ?? { label: humanWords(type), color: '#64748b' };

export const PAYMENT_MODE_LABEL: Record<string, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  WALLET: 'Canteen wallet',
  BANK_TRANSFER: 'Bank transfer',
  OTHER: 'Other',
};

export const paymentModeLabel = (mode: string) => PAYMENT_MODE_LABEL[mode] ?? humanWords(mode);

// Menu items store days as "MON,TUE,…"; schedules use "MONDAY".
export const WEEK_DAYS = [
  { code: 'MON', full: 'MONDAY', label: 'Mon', long: 'Monday' },
  { code: 'TUE', full: 'TUESDAY', label: 'Tue', long: 'Tuesday' },
  { code: 'WED', full: 'WEDNESDAY', label: 'Wed', long: 'Wednesday' },
  { code: 'THU', full: 'THURSDAY', label: 'Thu', long: 'Thursday' },
  { code: 'FRI', full: 'FRIDAY', label: 'Fri', long: 'Friday' },
  { code: 'SAT', full: 'SATURDAY', label: 'Sat', long: 'Saturday' },
  { code: 'SUN', full: 'SUNDAY', label: 'Sun', long: 'Sunday' },
];

export const dayLong = (full: string) => WEEK_DAYS.find((d) => d.full === full || d.code === full)?.long ?? humanWords(full);

// "MON,TUE,WED,THU,FRI" -> "Mon – Fri"; all seven -> "Every day".
export function daysSummary(csv: string): string {
  const codes = csv.split(',').map((d) => d.trim().toUpperCase()).filter(Boolean);
  const idx = WEEK_DAYS.map((d, i) => (codes.includes(d.code) ? i : -1)).filter((i) => i >= 0);
  if (idx.length === 0) return 'No days';
  if (idx.length === 7) return 'Every day';
  if (idx.length === 5 && idx[0] === 0 && idx[4] === 4) return 'Weekdays';
  if (idx.length === 2 && idx[0] === 5) return 'Weekends';
  const run = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (run && idx.length > 2) return `${WEEK_DAYS[idx[0]].label} – ${WEEK_DAYS[idx[idx.length - 1]].label}`;
  return idx.map((i) => WEEK_DAYS[i].label).join(', ');
}

// "13:30" -> "1:30 pm".
export function clockTime(value: string): string {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h)) return value;
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

export const dateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

// Short, readable reference for records without a number (UUIDs).
export const shortRef = (id: string) => (id.length > 12 ? `#${id.slice(0, 6).toUpperCase()}` : id);

export function humanWords(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Cash counted at close vs what the till should hold, in plain words.
export function cashDifference(variance: number): { label: string; color: string } {
  if (Math.abs(variance) < 0.005) return { label: 'Matched', color: '#15936a' };
  const amount = `₹${Math.abs(variance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  return variance > 0 ? { label: `${amount} extra`, color: '#c98500' } : { label: `${amount} short`, color: '#d03b3b' };
}

// "2h 15m" between two times (or until now for an open shift).
export function duration(startIso: string, endIso?: string | null): string {
  const minutes = Math.max(0, Math.round(((endIso ? new Date(endIso).getTime() : Date.now()) - new Date(startIso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)} days`;
}

// Ledger line in plain words: "Opening balance", "Money added", "Paid for an order".
export function txnLabel(t: { type: string; referenceType?: string | null; referenceId?: string | null; description?: string | null }): string {
  if (t.description) return t.description;
  if (t.referenceId === 'INITIAL_DEPOSIT') return 'Opening balance';
  switch (t.referenceType) {
    case 'TOPUP':
      return 'Money added';
    case 'ORDER':
    case 'PAYMENT':
      return t.type === 'CREDIT' ? 'Refund for an order' : 'Paid for an order';
    case 'REFUND':
      return 'Refund';
    default:
      return t.type === 'CREDIT' ? 'Money in' : 'Money out';
  }
}
