import { Link } from 'react-router-dom';
import { Edit, Eye, CheckCircle, Trash2 } from 'lucide-react';
import type { Book } from '../../types/library.types';
import { cn } from '../../../../utils/cn';
import { ROUTES } from '../../../../constants/routes';

interface BookTableProps {
  books: Book[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function BookTable({ books, className, onDelete }: BookTableProps) {
  const booksArray = Array.isArray(books) ? books : [];
  
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ISBN</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Title</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Author</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Publisher</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden xl:table-cell">Year</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Available</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {booksArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No books found. Add your first book to the catalog.
              </td>
            </tr>
          ) : (
            booksArray.map((book) => (
              <tr key={book.book_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-mono text-sm text-slate-700">{book.isbn}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {book.cover_image_url && (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="h-8 w-6 object-cover rounded"
                      />
                    )}
                    <div className="font-medium text-slate-900">{book.title}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">{book.author}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">{book.publisher}</td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden xl:table-cell">{book.publish_year}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {book._count?.copies && book._count.copies > 0 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">{book._count.copies} copies</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-500">
                        <span className="font-medium">No copies</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={ROUTES.LIBRARY_BOOKS_EDIT.replace(':id', book.book_id.toString())}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={ROUTES.LIBRARY_BOOKS_DETAILS.replace(':id', book.book_id.toString())}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => onDelete?.(book.book_id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}