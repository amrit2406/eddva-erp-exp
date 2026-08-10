export const PERMISSIONS = {
  // Auth permissions
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',

  // Dashboard permissions
  VIEW_DASHBOARD: 'dashboard:view',

  // Student permissions (for future use)
  VIEW_STUDENTS: 'students:view',
  CREATE_STUDENTS: 'students:create',
  EDIT_STUDENTS: 'students:edit',
  DELETE_STUDENTS: 'students:delete',

  // Teacher permissions (for future use)
  VIEW_TEACHERS: 'teachers:view',
  CREATE_TEACHERS: 'teachers:create',
  EDIT_TEACHERS: 'teachers:edit',
  DELETE_TEACHERS: 'teachers:delete',

  // Add more permissions as needed
} as const;
