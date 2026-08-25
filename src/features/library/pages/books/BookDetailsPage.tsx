import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Edit, CheckCircle, Plus, Barcode } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getBook, getBookCopies, createBookCopy, updateBookCopy } from '../../api/library.api';
import type { Book, BookCopy, BookCopyFormData, BookCopyUpdateData } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';
import CopyTable from '../../components/copies/CopyTable';
import CreateCopyModal from '../../components/copies/CreateCopyModal';
import EditCopyModal from '../../components/copies/EditCopyModal';

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBook();
    loadCopies();
  }, [id]);

  async function loadBook() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getBook(id);
      setBook(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  }

  async function loadCopies() {
    if (!id) return;
    try {
      const data = await getBookCopies(id);
      setCopies(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      console.error('Failed to load copies:', err);
    }
  }

  async function handleCreateCopy(data: BookCopyFormData) {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await createBookCopy(id, data);
      await loadCopies();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      if (err.response?.status === 409) {
        throw new Error('A copy with this barcode already exists');
      }
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateCopy(copyId: number, data: BookCopyUpdateData) {
    try {
      setIsSubmitting(true);
      console.log('Raw data from form:', data);
      
      // Only send fields that have values
      const updateData: BookCopyUpdateData = {};
      if (data.barcode) updateData.barcode = data.barcode;
      if (data.rack_location) updateData.rack_location = data.rack_location;
      if (data.condition) updateData.condition = data.condition;
      if (data.acquired_date) {
        // Convert date string to ISO-8601 format
        const isoDate = new Date(data.acquired_date).toISOString();
        console.log('Converting date:', data.acquired_date, 'to ISO:', isoDate);
        updateData.acquired_date = isoDate;
      }
      if (data.price !== undefined) updateData.price = data.price;
      if (data.status) updateData.status = data.status;
      
      console.log('Final updateData:', updateData);
      await updateBookCopy(copyId, updateData);
      await loadCopies();
      setIsEditModalOpen(false);
      setSelectedCopy(null);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditCopy(copy: BookCopy) {
    setSelectedCopy(copy);
    setIsEditModalOpen(true);
  }

  function handleDeleteCopy(_copyId: number) {
    // Note: Delete API not provided in requirements
    // When API is available, implement: await deleteBookCopy(copyId);
    alert('Delete functionality not yet implemented - API endpoint not provided');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Details</h1>
          <p className="text-slate-600 mt-1">View book information</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Details</h1>
          <p className="text-slate-600 mt-1">View book information</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error || 'Book not found'}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LIBRARY_BOOKS}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Book Details</h1>
            <p className="text-slate-600 mt-1">View book information</p>
          </div>
        </div>
        <Link to={ROUTES.LIBRARY_BOOKS_EDIT.replace(':id', book.book_id.toString())}>
          <Button variant="primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Book
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {book.cover_image_url && (
              <div className="w-full md:w-48 h-64 flex-shrink-0">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{book.title}</h2>
                <p className="text-slate-600 text-lg">{book.author}</p>
              </div>

              <div className="flex items-center gap-2">
                {book._count?.copies && book._count.copies > 0 ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{book._count.copies} copies</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                    <span className="font-medium">No copies</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">ISBN</div>
                  <div className="font-mono text-sm text-slate-900">{book.isbn}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Publisher</div>
                  <div className="text-slate-900">{book.publisher}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Edition</div>
                  <div className="text-slate-900">{book.edition}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Language</div>
                  <div className="text-slate-900">{book.language}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Publish Year</div>
                  <div className="text-slate-900">{book.publish_year}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Category ID</div>
                  <div className="text-slate-900">{book.category_id}</div>
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm text-slate-500 mb-1">Description</div>
                <p className="text-slate-700">{book.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Added: {new Date(book.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Updated: {new Date(book.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Copies Section */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Barcode className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Book Copies</h3>
              <span className="text-sm text-slate-500">({copies.length} copies)</span>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Copy
            </Button>
          </div>
          <CopyTable
            copies={copies}
            onEdit={handleEditCopy}
            onDelete={handleDeleteCopy}
          />
        </div>
      </Card>

      {/* Modals */}
      <CreateCopyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCopy}
        isLoading={isSubmitting}
      />
      <EditCopyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        copy={selectedCopy}
        onSubmit={handleUpdateCopy}
        isLoading={isSubmitting}
      />
    </div>
  );
}