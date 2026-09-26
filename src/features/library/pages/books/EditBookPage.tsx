import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import BookForm from '../../components/books/BookForm';
import { getBook, updateBook, uploadBookCover } from '../../api/library.api';
import type { BookFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditBookPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: book, isLoading, error, refetch } = useQuery({ queryKey: ['library', 'book', id], queryFn: () => getBook(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: async ({ data, cover }: { data: BookFormData; cover: File | null }) => {
      await updateBook(id, data);
      if (cover) await uploadBookCover(id, cover);
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'book', id] });
      toast.success(`“${data.title}” saved`);
      navigate(`/library/books/${id}`);
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'book', id] });
      toast.error(getApiErrorMessage(err, 'Could not save the book'));
    },
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: book ? `/library/books/${id}` : '/library/books', label: book?.title ?? 'Books' }} title="Edit book" />
      {isLoading ? (
        <FormLoading blocks={2} />
      ) : error || !book ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load book')} onRetry={() => refetch()} />
      ) : (
        <BookForm
          defaultValues={{
            title: book.title,
            author: book.author,
            category_id: book.category_id,
            isbn: book.isbn ?? '',
            publisher: book.publisher ?? '',
            edition: book.edition ?? '',
            language: book.language ?? '',
            publish_year: book.publish_year ?? undefined,
            description: book.description ?? '',
          }}
          currentCover={book.cover_image_url}
          bookId={book.book_id}
          onSubmit={(data, cover) => save.mutate({ data, cover })}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
