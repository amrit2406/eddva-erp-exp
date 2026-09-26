import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { Field, FormActions, FormCard } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { getBooks, getCategories } from '../../api/library.api';
import type { BookFormData } from '../../types/library.types';
import BookCover from './BookCover';

const LANGUAGES = ['English', 'Hindi', 'Odia', 'Sanskrit'];
const MAX_COVER_MB = 5;

interface BookFormProps {
  defaultValues?: BookFormData;
  currentCover?: string | null;
  bookId?: number;
  initialCategoryId?: number;
  onSubmit: (data: BookFormData, cover: File | null) => void;
  submitText: string;
  isSubmitting: boolean;
}

export default function BookForm({ defaultValues, currentCover, bookId, initialCategoryId, onSubmit, submitText, isSubmitting }: BookFormProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['library', 'categories'], queryFn: getCategories });
  const { data: books = [] } = useQuery({ queryKey: ['library', 'books'], queryFn: getBooks });

  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [author, setAuthor] = useState(defaultValues?.author ?? '');
  const [categoryId, setCategoryId] = useState(String(defaultValues?.category_id ?? initialCategoryId ?? ''));
  const [isbn, setIsbn] = useState(defaultValues?.isbn ?? '');
  const [publisher, setPublisher] = useState(defaultValues?.publisher ?? '');
  const [edition, setEdition] = useState(defaultValues?.edition ?? '');
  const [language, setLanguage] = useState(defaultValues?.language ?? 'English');
  const [year, setYear] = useState(defaultValues?.publish_year ? String(defaultValues.publish_year) : '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [cover, setCover] = useState<File | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const preview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const thisYear = new Date().getFullYear();
  const yearValue = year.trim() === '' ? undefined : Number(year);
  const sameIsbn = isbn.trim() && books.find((b) => b.book_id !== bookId && (b.isbn ?? '').trim() === isbn.trim());

  const errors = {
    title: !title.trim() ? 'Enter the title' : title.length > 255 ? 'Too long' : undefined,
    author: !author.trim() ? 'Enter the author' : undefined,
    categoryId: !categoryId ? 'Choose a category' : undefined,
    isbn: sameIsbn ? `Already used by “${sameIsbn.title}”` : undefined,
    year: yearValue !== undefined && (!Number.isInteger(yearValue) || yearValue < 1000 || yearValue > thisYear + 1) ? `Enter a year like ${thisYear}` : undefined,
    cover: cover && cover.size > MAX_COVER_MB * 1024 * 1024 ? `Pick an image under ${MAX_COVER_MB} MB` : undefined,
  };
  const show = (e?: string) => (showErrors ? e : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    onSubmit(
      {
        title: title.trim(),
        author: author.trim(),
        category_id: Number(categoryId),
        isbn: isbn.trim() || undefined,
        publisher: publisher.trim() || undefined,
        edition: edition.trim() || undefined,
        language: language.trim() || undefined,
        publish_year: yearValue,
        description: description.trim() || undefined,
      },
      cover,
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Book">
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="flex flex-col items-center gap-2">
            {preview ? (
              <img src={preview} alt="New cover" className="h-40 w-28 rounded-xl object-cover shadow-sm ring-1 ring-slate-200" />
            ) : (
              <BookCover src={currentCover} title={title || 'Book'} size="lg" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-navy">
              <ImagePlus className="h-3.5 w-3.5" /> {currentCover || cover ? 'Change cover' : 'Add cover'}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
            </label>
            {cover && (
              <button type="button" onClick={() => setCover(null)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                <X className="h-3 w-3" /> Remove
              </button>
            )}
            {errors.cover && <p className="max-w-[9rem] text-center text-xs text-red-600">{errors.cover}</p>}
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Field label="Title" error={show(errors.title)} className="sm:col-span-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wings of Fire" autoFocus={!defaultValues} className={inputClass} />
            </Field>
            <Field label="Author" error={show(errors.author)}>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. A. P. J. Abdul Kalam" className={inputClass} />
            </Field>
            <Field label="Category" error={show(errors.categoryId)}>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                <option value="">Choose a category</option>
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              {categories.length === 0 && (
                <Link to="/library/categories/new" className="mt-1 inline-block text-xs font-medium text-brand hover:text-brand-navy">
                  Add a category first
                </Link>
              )}
            </Field>
            <Field label="Description (optional)" className="sm:col-span-2">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="A line about what it's about" className={inputClass} />
            </Field>
          </div>
        </div>
      </FormCard>

      <FormCard title="Publishing details (optional)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="ISBN" error={errors.isbn} className="lg:col-span-2">
            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="e.g. 9788173711466" autoComplete="off" className={inputClass} />
          </Field>
          <Field label="Publisher">
            <input value={publisher} onChange={(e) => setPublisher(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Edition">
            <input value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="e.g. 2nd" className={inputClass} />
          </Field>
          <Field label="Year" error={show(errors.year)}>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder={String(thisYear)} className={inputClass} />
          </Field>
          <Field label="Language">
            <input value={language} onChange={(e) => setLanguage(e.target.value)} list="book-languages" className={inputClass} />
            <datalist id="book-languages">
              {LANGUAGES.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
