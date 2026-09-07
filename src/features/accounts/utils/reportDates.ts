export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function firstDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
