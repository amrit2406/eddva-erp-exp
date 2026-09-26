import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ScanLine } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';
import { scanCopyByBarcode } from '../../api/library.api';

// Scan (or type) a copy's barcode and jump straight to its book.
export default function CopyScanBox() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const scan = useMutation({
    mutationFn: (barcode: string) => scanCopyByBarcode(barcode),
    onSuccess: (copy) => {
      const bookId = copy?.book?.book_id ?? copy?.book_id;
      if (bookId) navigate(`/library/books/${bookId}`);
    },
    onError: () => toast.error(`No copy has the barcode “${code.trim()}”`),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) scan.mutate(code.trim());
      }}
      className="relative"
    >
      <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={scan.isPending ? 'Finding…' : 'Scan a copy barcode'}
        aria-label="Scan a copy barcode"
        autoComplete="off"
        className="w-52 rounded-xl bg-white py-2.5 pl-9 pr-3 text-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </form>
  );
}
