import { useAuthStore } from '../stores/auth.store';

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (): boolean => {
    // This will be implemented when we have a real permission system
    // For now, return true for all permissions
    return true;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    user,
  };
}
