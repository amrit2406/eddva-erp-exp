import { MEAL_SUGGESTIONS } from './messMenu';

// RBAC resource the mess attendance endpoints are checked against.
export const MESS_ATTENDANCE_RESOURCE = 'mess_attendance';

export const MESS_STATUSES = ['opted_in', 'opted_out', 'attended', 'absent'] as const;

export const MEAL_TYPES = MEAL_SUGGESTIONS;

// The meal most likely being served right now.
export function defaultMeal(): string {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'snacks';
  return 'dinner';
}
