import type { LucideIcon } from 'lucide-react';
import { Ban, CheckCircle2, FilePen, Hourglass, PackageCheck, PackageOpen, XCircle } from 'lucide-react';

export interface PoStatusInfo {
  label: string;
  // What it means / what happens next, in everyday words.
  hint: string;
  icon: LucideIcon;
  color: string;
}

// Plain-language names for purchase order statuses. Colors are distinct hues
// from the dashboard palette; every status also carries an icon and a label.
export const PO_STATUS: Record<string, PoStatusInfo> = {
  DRAFT: { label: 'Draft', hint: 'Being prepared — not sent yet', icon: FilePen, color: '#64748b' },
  PENDING_APPROVAL: { label: 'Waiting for approval', hint: 'Needs a manager to approve', icon: Hourglass, color: '#c98500' },
  APPROVED: { label: 'Approved', hint: 'Ready — waiting for the goods', icon: CheckCircle2, color: '#008BE9' },
  PARTIALLY_RECEIVED: { label: 'Partly received', hint: 'Some goods have arrived', icon: PackageOpen, color: '#7c3aed' },
  CLOSED: { label: 'Completed', hint: 'All goods received', icon: PackageCheck, color: '#15936a' },
  REJECTED: { label: 'Rejected', hint: 'Not approved by the manager', icon: XCircle, color: '#d03b3b' },
  CANCELLED: { label: 'Cancelled', hint: 'Stopped before completion', icon: Ban, color: '#94a3b8' },
};

// The normal path, in order, and the ways off it.
export const PO_FLOW = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'CLOSED'] as const;
export const PO_EXITS = ['REJECTED', 'CANCELLED'] as const;

export function poStatusInfo(status: string): PoStatusInfo {
  return (
    PO_STATUS[status] ?? {
      label: status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      hint: '',
      icon: FilePen,
      color: '#64748b',
    }
  );
}

// Only drafts can be edited (matches the details page).
export const canEditPo = (status: string) => status === 'DRAFT';

// Goods are still expected for these statuses, so a past delivery date is late.
export const awaitingDelivery = (status: string) => status === 'APPROVED' || status === 'PARTIALLY_RECEIVED';
