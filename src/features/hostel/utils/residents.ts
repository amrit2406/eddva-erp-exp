import type { HostelResident } from '../types/hostel.types';

export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Academic years run from April, e.g. 2026-27.
export function currentAcademicYear(): string {
  const now = new Date();
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export function residentStatus(resident: HostelResident): string | null {
  if (resident.status) return resident.status.toLowerCase();
  if (resident.is_active !== undefined) return resident.is_active ? 'active' : 'inactive';
  return null;
}

// Which lifecycle action fits the resident's status. An unknown status offers
// every action and lets the backend decide.
export function statusActions(resident: HostelResident) {
  const status = residentStatus(resident);
  if (status === null) return { suspend: true, reinstate: true, readmit: true };
  return {
    suspend: status === 'active',
    reinstate: status === 'suspended',
    readmit: status !== 'active' && status !== 'suspended',
  };
}

// An allotment lookup either has data or is empty/null.
export function hasRecordData(data: Record<string, unknown> | unknown[] | null | undefined): boolean {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  return Object.values(data).some((value) => value !== null && value !== undefined);
}
