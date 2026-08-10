import type { Department } from '../types/department.types';

export const mockDepartments: Department[] = [
  {
    id: 'DEPT001',
    name: 'Administration',
    code: 'ADM',
    headOfDepartment: 'Sarah Johnson',
    isActive: true,
  },
  {
    id: 'DEPT002',
    name: 'Academics',
    code: 'ACD',
    headOfDepartment: 'Michael Brown',
    isActive: true,
  },
  {
    id: 'DEPT003',
    name: 'Admissions',
    code: 'ADMN',
    headOfDepartment: 'Jennifer Lee',
    isActive: true,
  },
  {
    id: 'DEPT004',
    name: 'Facilities',
    code: 'FAC',
    headOfDepartment: 'David Miller',
    isActive: true,
  },
  {
    id: 'DEPT005',
    name: 'Human Resources',
    code: 'HR',
    headOfDepartment: 'Lisa Anderson',
    isActive: true,
  },
  {
    id: 'DEPT006',
    name: 'Reception',
    code: 'RCP',
    headOfDepartment: 'James Wilson',
    isActive: true,
  },
];
