import { create } from 'zustand';

interface SchoolState {
  schoolId: string | null;
  academicYear: string | null;
  setSchool: (schoolId: string, academicYear: string) => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
  schoolId: null,
  academicYear: null,
  setSchool: (schoolId, academicYear) => set({ schoolId, academicYear }),
}));
