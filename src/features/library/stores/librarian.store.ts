import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LibrarianState {
  librarianId: number;
  setLibrarianId: (id: number) => void;
}

export const useLibrarianStore = create<LibrarianState>()(
  persist(
    (set) => ({
      librarianId: 1,
      setLibrarianId: (id) => set({ librarianId: id }),
    }),
    {
      name: 'library-librarian-storage',
    }
  )
);
