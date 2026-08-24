import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getBook, updateBook, getCategories, uploadBookCover } from '../../api/library.api';
import type { BookFormData, Category } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function EditBookPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<BookFormData>({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    edition: '',
    category_id: 0,
    language: 'English',
    publish_year: new Date().getFullYear(),
    description: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const [bookData, categoriesData] = await Promise.all([
        getBook(id),
        getCategories()
      ]);
      setFormData({
        isbn: bookData.isbn,
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher,
        edition: bookData.edition,
        category_id: bookData.category_id,
        language: bookData.language,
        publish_year: bookData.publish_year,
        description: bookData.description
      });
      setCategories(categoriesData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateBook(id, formData);
      navigate(ROUTES.LIBRARY_BOOKS);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to update book');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoverUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !coverFile) return;
    try {
      setUploadingCover(true);
      setError(null);
      await uploadBookCover(id, coverFile);
      alert('Cover image uploaded successfully');
      setCoverFile(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err.response?.data?.message || 'Failed to upload cover');
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Book</h1>
          <p className="text-slate-600 mt-1">Update book details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Book</h1>
        <p className="text-slate-600 mt-1">Update book details</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-slate-700 mb-1">
                  ISBN *
                </label>
                <input
                  type="text"
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="e.g., 978-0-06-112008-4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., To Kill a Mockingbird"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g., Harper Lee"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-slate-700 mb-1">
                  Publisher *
                </label>
                <input
                  type="text"
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="e.g., HarperCollins"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="edition" className="block text-sm font-medium text-slate-700 mb-1">
                  Edition *
                </label>
                <input
                  type="text"
                  id="edition"
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  placeholder="e.g., 1st"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-slate-700 mb-1">
                  Language *
                </label>
                <input
                  type="text"
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="e.g., English"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="publish_year" className="block text-sm font-medium text-slate-700 mb-1">
                  Publish Year *
                </label>
                <input
                  type="number"
                  id="publish_year"
                  value={formData.publish_year}
                  onChange={(e) => setFormData({ ...formData, publish_year: parseInt(e.target.value) || 0 })}
                  min="1000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.LIBRARY_BOOKS)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Book'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cover Image</h2>
          <form onSubmit={handleCoverUpload} className="space-y-4">
            <div>
              <input
                type="file"
                id="cover"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverFile(file);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>
            <Button type="submit" variant="secondary" disabled={!coverFile || uploadingCover}>
              {uploadingCover ? 'Uploading...' : 'Upload Cover'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}