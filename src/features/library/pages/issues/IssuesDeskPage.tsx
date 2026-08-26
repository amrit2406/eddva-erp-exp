import { useEffect, useState } from 'react';
import { Barcode, Search, BookOpen, User, X, BookmarkPlus } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import IssuesTabs from '../../components/issues/IssuesTabs';
import BarcodeScanner from '../../components/copies/BarcodeScanner';
import ReserveBookModal from '../../components/reservations/ReserveBookModal';
import { searchBooks, getBookCopies, getMembers, scanCopyByBarcode } from '../../api/library.api';
import { createIssue } from '../../api/issues.api';
import { useLibrarianStore } from '../../stores/librarian.store';
import { getApiErrorMessage } from '../../utils/apiError';
import type { Book, BookCopy, Member } from '../../types/library.types';

export default function IssuesDeskPage() {
  const { toast } = useToast();
  const { librarianId } = useLibrarianStore();

  const [copyMode, setCopyMode] = useState<'scan' | 'search'>('scan');
  const [selectedCopy, setSelectedCopy] = useState<(BookCopy & { book_title?: string }) | null>(null);

  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);

  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

  useEffect(() => {
    if (!memberQuery.trim()) {
      setMemberResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await getMembers({ search: memberQuery.trim() });
        setMemberResults(results);
      } catch {
        setMemberResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [memberQuery]);

  async function handleBookSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!bookQuery.trim()) return;
    try {
      const results = await searchBooks(bookQuery.trim());
      setBookResults(results);
    } catch {
      setBookResults([]);
    }
  }

  async function handlePickBook(book: Book) {
    setActiveBook(book);
    try {
      const copies = await getBookCopies(book.book_id);
      setAvailableCopies(copies.filter((c) => c.status === 'available'));
    } catch {
      setAvailableCopies([]);
    }
  }

  function handlePickCopy(copy: BookCopy, bookTitle?: string) {
    setSelectedCopy({ ...copy, book_title: bookTitle });
  }

  async function handleScan(barcode: string) {
    const copy = await scanCopyByBarcode(barcode);
    setSelectedCopy(copy);
    return copy;
  }

  function resetCopySelection() {
    setSelectedCopy(null);
    setActiveBook(null);
    setAvailableCopies([]);
    setBookResults([]);
    setBookQuery('');
  }

  function resetMemberSelection() {
    setSelectedMember(null);
    setMemberQuery('');
    setMemberResults([]);
  }

  async function handleIssue() {
    if (!selectedCopy || !selectedMember) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createIssue({
        copy_id: selectedCopy.copy_id,
        member_id: selectedMember.member_id,
        issued_by: librarianId,
      });
      toast.success(`Issued "${selectedCopy.book_title ?? 'book'}" to ${selectedMember.name}`);
      resetCopySelection();
      resetMemberSelection();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to issue book'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Issues Desk</h1>
        <p className="text-slate-600 mt-1">Issue a book to a member</p>
      </div>

      <IssuesTabs />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Copy picker */}
        <Card className="border-slate-200">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Copy
              </h3>
              {selectedCopy ? (
                <button onClick={resetCopySelection} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Change
                </button>
              ) : (
                <div className="flex gap-1 text-sm">
                  <button
                    onClick={() => setCopyMode('scan')}
                    className={cn('px-3 py-1 rounded-md', copyMode === 'scan' ? 'bg-blue-100 text-blue-700' : 'text-slate-500')}
                  >
                    Scan
                  </button>
                  <button
                    onClick={() => setCopyMode('search')}
                    className={cn('px-3 py-1 rounded-md', copyMode === 'search' ? 'bg-blue-100 text-blue-700' : 'text-slate-500')}
                  >
                    Search
                  </button>
                </div>
              )}
            </div>

            {selectedCopy ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-900">{selectedCopy.book_title ?? `Book #${selectedCopy.book_id}`}</p>
                <p className="text-sm text-green-700 mt-1">
                  Barcode: {selectedCopy.barcode} | Copy ID: {selectedCopy.copy_id} | Location: {selectedCopy.rack_location}
                </p>
              </div>
            ) : copyMode === 'scan' ? (
              <BarcodeScanner onScan={handleScan} />
            ) : (
              <div className="space-y-3">
                <form onSubmit={handleBookSearch} className="flex gap-2">
                  <Input
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                    placeholder="Search by title, author, ISBN..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="secondary">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {!activeBook && bookResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {bookResults.map((book) => (
                      <button
                        key={book.book_id}
                        onClick={() => handlePickBook(book)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                      >
                        <span className="font-medium text-slate-900">{book.title}</span>
                        <span className="text-slate-500"> — {book.author}</span>
                      </button>
                    ))}
                  </div>
                )}

                {activeBook && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">{activeBook.title}</span>
                      <button onClick={() => { setActiveBook(null); setAvailableCopies([]); }} className="text-slate-500 hover:text-slate-700">
                        Back
                      </button>
                    </div>
                    {availableCopies.length === 0 ? (
                      <div className="py-2 space-y-2">
                        <p className="text-sm text-slate-500">No available copies for this book.</p>
                        <Button variant="secondary" size="sm" onClick={() => setIsReserveModalOpen(true)}>
                          <BookmarkPlus className="h-4 w-4 mr-2" />
                          Reserve Instead
                        </Button>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {availableCopies.map((copy) => (
                          <button
                            key={copy.copy_id}
                            onClick={() => handlePickCopy(copy, activeBook.title)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                          >
                            Copy #{copy.copy_id} — {copy.barcode} — {copy.rack_location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Member picker */}
        <Card className="border-slate-200">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Member
              </h3>
              {selectedMember && (
                <button onClick={resetMemberSelection} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Change
                </button>
              )}
            </div>

            {selectedMember ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-900">{selectedMember.name}</p>
                <p className="text-sm text-green-700 mt-1">
                  Card: {selectedMember.library_card_number} | {selectedMember.member_type} | {selectedMember.status}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Search by name or card number..."
                />
                {memberResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {memberResults.map((member) => (
                      <button
                        key={member.member_id}
                        onClick={() => setSelectedMember(member)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                      >
                        <span className="font-medium text-slate-900">{member.name}</span>
                        <span className="text-slate-500"> — {member.library_card_number} ({member.status})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleIssue}
          disabled={!selectedCopy || !selectedMember || isSubmitting}
          size="lg"
        >
          <Barcode className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Issuing...' : 'Issue Book'}
        </Button>
      </div>

      {activeBook && (
        <ReserveBookModal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          bookId={activeBook.book_id}
          bookTitle={activeBook.title}
          onReserved={resetCopySelection}
        />
      )}
    </div>
  );
}
