export function isInstituteAdminToken(token: string): boolean {
  if (!token) return false;
  
  try {
    // For JWT tokens, check if the payload contains admin role
    // This is a simplified check - adjust based on your actual JWT structure
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.role === 'admin' || payload.is_admin === true || payload.institute_admin === true;
    }
    
    // For bearer tokens that might be API keys, check for admin pattern
    return token.toLowerCase().includes('admin');
  } catch {
    return false;
  }
}
