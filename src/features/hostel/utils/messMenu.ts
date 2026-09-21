import { isPlainObject, isPrimitive } from './format';
import type { MenuSlot } from '../types/hostel.types';

// RBAC resource the mess menu endpoints are checked against.
export const MESS_MENU_RESOURCE = 'mess_menu';

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MEAL_ORDER = ['breakfast', 'lunch', 'snacks', 'dinner'];

export const MEAL_SUGGESTIONS = MEAL_ORDER;

const isDay = (key: string) => WEEKDAYS.includes(key.toLowerCase());

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function todayWeekday(): string {
  // getDay(): 0 = Sunday.
  return WEEKDAYS[(new Date().getDay() + 6) % 7];
}

export function dayRank(day: string): number {
  const rank = WEEKDAYS.indexOf(day.toLowerCase());
  return rank === -1 ? WEEKDAYS.length : rank;
}

export function mealRank(meal: string): number {
  const rank = MEAL_ORDER.indexOf(meal.toLowerCase());
  return rank === -1 ? MEAL_ORDER.length : rank;
}

function toItems(value: unknown): string[] {
  const parts: unknown[] = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,\n]/) : [];
  return parts
    .map((part) => (isPlainObject(part) ? String(part.name ?? part.item ?? '') : String(part ?? '')))
    .map((part) => part.trim())
    .filter(Boolean);
}

// { monday: [...dishes], tuesday: [...] } — the days hold the dishes themselves, so the
// key above them is a meal. (If the days held objects keyed by meal, the key above
// would just be a wrapper such as `menu`.)
function isMealFirst(value: unknown): boolean {
  return (
    isPlainObject(value) &&
    Object.entries(value).some(
      ([key, child]) =>
        isDay(key) && (Array.isArray(child) || (isPlainObject(child) && ('items' in child || 'dishes' in child)))
    )
  );
}

// The weekly and per-day endpoints' shapes aren't pinned down, so this accepts
// the likely ones — a list of {day_of_week, meal_type, items} rows, or objects
// nested by day then meal (or meal then day) — and returns flat slots. An empty
// result means "unrecognised", and the caller falls back to the generic view.
export function normalizeMenuPayload(data: unknown, defaultDay?: string): MenuSlot[] {
  const found = new Map<string, MenuSlot>();

  const add = (day: string, meal: string, items: string[]) => {
    const key = `${day}|${meal}`;
    if (!found.has(key)) found.set(key, { day, meal, items });
  };

  const visit = (node: unknown, day: string | undefined, meal: string | undefined, depth: number) => {
    if (depth > 5) return;

    if (Array.isArray(node)) {
      if (node.length > 0 && node.every((entry) => typeof entry === 'string') && day && meal) {
        add(day, meal, toItems(node));
        return;
      }
      node.forEach((entry) => visit(entry, day, meal, depth + 1));
      return;
    }
    if (!isPlainObject(node)) return;

    // A row: its own day/meal win over the context it was found in.
    const rowDay = String(node.day_of_week ?? node.day ?? day ?? '').toLowerCase();
    const rowMeal = String(node.meal_type ?? node.meal ?? meal ?? '').toLowerCase();
    if (rowDay && rowMeal && ('items' in node || 'dishes' in node)) {
      add(rowDay, rowMeal, toItems(node.items ?? node.dishes));
      return;
    }

    Object.entries(node).forEach(([key, value]) => {
      if (isPrimitive(value)) return;
      if (isDay(key)) visit(value, key.toLowerCase(), meal, depth + 1);
      else if (day && !meal) visit(value, day, key.toLowerCase(), depth + 1);
      else if (!day && !meal && isMealFirst(value)) visit(value, undefined, key.toLowerCase(), depth + 1);
      else visit(value, day, meal, depth + 1);
    });
  };

  visit(data, defaultDay?.toLowerCase(), undefined, 0);
  return [...found.values()];
}
