import { useState } from 'react';
import { UserCog, Check } from 'lucide-react';
import { useLibrarianStore } from '../../stores/librarian.store';

export default function LibrarianIdControl() {
  const { librarianId, setLibrarianId } = useLibrarianStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(librarianId));

  function startEdit() {
    setDraft(String(librarianId));
    setIsEditing(true);
  }

  function save() {
    const parsed = parseInt(draft, 10);
    if (parsed > 0) {
      setLibrarianId(parsed);
    }
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex items-center gap-1"
      >
        <UserCog className="h-4 w-4 text-slate-400" />
        <input
          type="number"
          min="1"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="text-slate-500 hover:text-slate-700">
          <Check className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={startEdit}
      title="Change the librarian ID used for issue/return/renew actions"
      className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
    >
      <UserCog className="h-3.5 w-3.5" />
      Acting as Librarian #{librarianId}
    </button>
  );
}
