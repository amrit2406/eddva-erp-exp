export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const response = (err as { response?: { data?: { error?: { message?: string } } } })?.response;
  const backendMessage = response?.data?.error?.message;
  if (backendMessage) return backendMessage;

  const genericMessage = (err as { message?: string })?.message;
  if (genericMessage) return genericMessage;

  return fallback;
}
