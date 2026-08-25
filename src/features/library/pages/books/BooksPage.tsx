import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Barcode } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import BookTable from '../../components/books/BookTable';
import { getBooks, searchBooks, deleteBook, scanCopyByBarcode } from '../../api/library.api';
import type { Book } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function BooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadBooks();
      return;
    }
    try {
      setLoading(true);
      const results = await searchBooks(searchQuery);
      setBooks(results);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }
    try {
      await deleteBook(id);
      loadBooks();
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleScanBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const copy = await scanCopyByBarcode(barcodeQuery.trim());
      console.log('Scan result:', copy);
      
      // Handle different response structures - book_id is nested in book object
      const bookId = copy?.book_id || (copy as any)?.book?.book_id || (copy as any)?.data?.book_id;
      if (!bookId) {
        console.error('No book_id found in response:', copy);
        throw new Error('Invalid copy data received - no book_id');
      }
      navigate(ROUTES.LIBRARY_BOOKS_DETAILS.replace(':id', bookId.toString()));
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Copy not found');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Catalog</h1>
          <p className="text-slate-600 mt-1">Manage library book collection</p>
        </div>
        <Link to={ROUTES.LIBRARY_BOOKS_NEW}>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <form onSubmit={handleSearch}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, ISBN..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            <form onSubmit={handleScanBarcode}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    placeholder="Scan barcode to find book copy..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={isScanning}>
                  <Barcode className="h-4 w-4 mr-2" />
                  {isScanning ? 'Scanning...' : 'Scan'}
                </Button>
              </div>
              {scanError && (
                <div className="mt-2 text-sm text-red-600">{scanError}</div>
              )}
            </form>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <BookTable books={books} onDelete={handleDelete} />
          )}
        </div>
      </Card>
    </div>
  );
}