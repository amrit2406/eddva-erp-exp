const csvCell = (v: string | number) => {
  const text = String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Save rows as a CSV file (with a BOM so Excel reads ₹ and names correctly).
export function downloadCsv(fileName: string, header: string[], rows: (string | number)[][]) {
  const csv = [header, ...rows].map((line) => line.map(csvCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
