// Saves a blob through a temporary link (the browser's normal download flow).
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const EXTENSIONS: Record<string, string> = {
  'text/csv': 'csv',
  'application/json': 'json',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

// Extension for a downloaded file when the server didn't name it.
export function extensionForMime(mime: string): string {
  return EXTENSIONS[mime.split(';')[0].trim().toLowerCase()] ?? '';
}
