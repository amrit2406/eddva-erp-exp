function formatValidationDetails(details: unknown): string | null {
  if (!details) return null;

  if (Array.isArray(details) && details.length > 0) {
    const lines = details.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const field = (item as any).field || (item as any).path || (item as any).param;
        const message = (item as any).message || (item as any).error || JSON.stringify(item);
        const fieldLabel = Array.isArray(field) ? field.join('.') : field;
        return fieldLabel ? `${fieldLabel}: ${message}` : message;
      }
      return String(item);
    });
    return lines.join('; ');
  }

  if (typeof details === 'object' && Object.keys(details).length > 0) {
    return Object.entries(details)
      .map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`)
      .join('; ');
  }

  return null;
}

export function getApiErrorMessage(error: any, defaultMessage: string): string {
  if (error?.response?.status === 403) {
    return "You don't have permission to do this. Please contact your administrator if you need access.";
  }

  const apiError = error.response?.data?.error;
  const details = formatValidationDetails(apiError?.details ?? error.response?.data?.details);

  if (apiError?.message) {
    return details ? `${apiError.message}: ${details}` : apiError.message;
  }
  if (error.response?.data?.message) {
    return details ? `${error.response.data.message}: ${details}` : error.response.data.message;
  }
  if (typeof apiError === 'string') {
    return apiError;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
}
