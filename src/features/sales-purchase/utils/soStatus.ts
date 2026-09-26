import type { LucideIcon } from 'lucide-react';
import { Ban, CheckCircle2, FilePen, FileText, PackageCheck } from 'lucide-react';

export interface SoStatusInfo {
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
}

// Plain-language sales order statuses.
export const SO_STATUS: Record<string, SoStatusInfo> = {
  DRAFT: { label: 'Draft', hint: 'Being prepared — not confirmed yet', icon: FilePen, color: '#64748b' },
  CONFIRMED: { label: 'Confirmed', hint: 'Agreed with the customer — ready to invoice', icon: CheckCircle2, color: '#008BE9' },
  PARTIALLY_INVOICED: { label: 'Part invoiced', hint: 'Some of it has been billed', icon: FileText, color: '#7c3aed' },
  CLOSED: { label: 'Completed', hint: 'Fully invoiced', icon: PackageCheck, color: '#15936a' },
  CANCELLED: { label: 'Cancelled', hint: 'Stopped before completion', icon: Ban, color: '#94a3b8' },
};

export const SO_FLOW = ['DRAFT', 'CONFIRMED', 'PARTIALLY_INVOICED', 'CLOSED'] as const;
export const SO_EXITS = ['CANCELLED'] as const;

export function soStatusInfo(status: string): SoStatusInfo {
  return SO_STATUS[status] ?? { label: status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), hint: '', icon: FilePen, color: '#64748b' };
}
