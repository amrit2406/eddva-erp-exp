export function isInstituteAdminToken(token: string): boolean {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return (
        payload.application === 'INSTITUTE_ADMIN' ||
        payload.role === 'Institute Administrator' ||
        payload.role === 'admin' ||
        payload.is_admin === true ||
        payload.institute_admin === true
      );
    }

    // For bearer tokens that might be API keys, check for admin pattern
    return token.toLowerCase().includes('admin');
  } catch {
    return false;
  }
}
