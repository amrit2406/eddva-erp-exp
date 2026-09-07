export function buildReportParams(from?: string, to?: string): { from: string; to: string } {
  if (!from || !to) {
    throw new Error('Please select both a from and to date');
  }
  return { from, to };
}
