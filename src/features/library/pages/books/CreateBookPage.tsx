import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import BookForm from '../../components/books/BookForm';
import { createBook, uploadBookCover } from '../../api/library.api';
import type { Book, BookFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateBookPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryId = Number(searchParams.get('categoryId')) || undefined;

  const create = useMutation({
    mutationFn: async ({ data, cover }: { data: BookFormData; cover: File | null }): Promise<{ book: Book; coverFailed: boolean }> => {
      const book = await createBook(data);
      if (!cover || !book?.book_id) return { book, coverFailed: false };
      try {
        await uploadBookCover(book.book_id, cover);
        return { book, coverFailed: false };
      } catch {
        return { book, coverFailed: true };
      }
    },
    onSuccess: ({ book, coverFailed }, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'books'] });
      if (coverFailed) toast.error(`“${data.title}” added, but the cover didn't upload — try again from Edit`);
      else toast.success(`“${data.title}” added — now add its copies`);
      navigate(book?.book_id ? `/library/books/${book.book_id}` : '/library/books');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the book')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/library/books', label: 'Books' }} title="New book" subtitle="Add the title once, then add each physical copy on its page." />
      <BookForm initialCategoryId={categoryId} onSubmit={(data, cover) => create.mutate({ data, cover })} isSubmitting={create.isPending} submitText="Add book" />
    </div>
  );
}
