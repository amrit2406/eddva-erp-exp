export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'on_leave'] as const;

export const ATTENDANCE_SESSIONS = ['morning', 'evening', 'night'] as const;

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
}

// Roll calls usually happen in the morning or at night.
export function defaultSession(): string {
  return new Date().getHours() < 12 ? 'morning' : 'night';
}
