import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, BookCheck, BookOpen, CheckCircle2, ScanLine, Search, UserRound, X } from 'lucide-react';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { btnPrimary, cardClass, inputClass, longDate } from '../../../../components/premium/styles';
import { useToast } from '../../../../hooks/useToast';
import { rupees } from '../../../../utils/dashboardFormat';
import BookCover from '../../components/books/BookCover';
import { ReserveDialog } from '../../components/books/BookDialogs';
import LoanTabs from '../../components/issues/LoanTabs';
import { ReturnDialog } from '../../components/loans/LoanDialogs';
import MemberPicker from '../../components/members/MemberPicker';
import { createIssue, getIssue, getIssues } from '../../api/issues.api';
import { getBook, getBookCopies, getBooks, getMember, getMemberFines, getMembershipRules, scanCopyByBarcode } from '../../api/library.api';
import { useToday } from '../../hooks/useToday';
import { useLibrarianStore } from '../../stores/librarian.store';
import type { Book, BookCopy, BookIssue, Member } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { copyStatusInfo, fineLeft, isOut, loanState, memberStatusInfo, memberTypePlural } from '../../utils/labels';

const FINE_BLOCK = 100;

type Picked = { copy: BookCopy; book: Pick<Book, 'book_id' | 'title' | 'author' | 'cover_image_url'> };

export default function IssuesDeskPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'lend' | 'return'>('lend');
  const today = useToday();
  const { data: issues = [] } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });
  const overdue = issues.filter((i) => loanState(i, today) === 'overdue').length;

  return (
    <div className="space-y-5">
      <ListHeader icon={ArrowLeftRight} title="Lending desk" description="Lend a book to a member, or take one back. A barcode scanner works in every box.">
        <LoanTabs overdue={overdue} />
      </ListHeader>
      <Segmented
        label="Desk mode"
        value={mode}
        onChange={(v) => setMode(v as 'lend' | 'return')}
        options={[
          { value: 'lend', label: 'Lend a book' },
          { value: 'return', label: 'Take a book back' },
        ]}
      />
      {mode === 'lend' ? (
        <LendPanel initialBookId={searchParams.get('bookId')} initialMemberId={searchParams.get('memberId')} onSwitchToReturn={() => setMode('return')} />
      ) : (
        <ReturnPanel />
      )}
    </div>
  );
}

function LendPanel({ initialBookId, initialMemberId, onSwitchToReturn }: { initialBookId: string | null; initialMemberId: string | null; onSwitchToReturn: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = useToday();
  const { librarianId } = useLibrarianStore();
  const [picked, setPicked] = useState<Picked | null>(null);
  // undefined = untouched, so a member passed in the link (from a member page) is used.
  const [chosen, setMember] = useState<Member | null | undefined>(undefined);
  const [lastLent, setLastLent] = useState<{ issueId?: number; title: string; name: string; due: string } | null>(null);
  const { data: linkedMember } = useQuery({ queryKey: ['library', 'member', initialMemberId], queryFn: () => getMember(initialMemberId!), enabled: Boolean(initialMemberId) });
  const member = chosen === undefined ? (linkedMember ?? null) : chosen;

  const { data: rules = [] } = useQuery({ queryKey: ['library', 'membership-rules'], queryFn: getMembershipRules });
  const { data: issues = [] } = useQuery({ queryKey: ['library', 'issues'], queryFn: () => getIssues() });
  const { data: fines = [] } = useQuery({ queryKey: ['library', 'member-fines', String(member?.member_id)], queryFn: () => getMemberFines(member!.member_id), enabled: Boolean(member) });

  const rule = rules.find((r) => r.member_type === member?.member_type);
  const theirs = member ? issues.filter((i) => i.member_id === member.member_id && isOut(i)) : [];
  const late = theirs.filter((i) => loanState(i, today) === 'overdue').length;
  const owed = fines.reduce((s, f) => s + fineLeft(f), 0);
  const due = rule ? new Date(today.getTime() + rule.loan_period_days * 86400000).toISOString() : null;

  const problem = !member
    ? null
    : member.status !== 'active'
      ? `${member.name} is ${memberStatusInfo(member.status).label.toLowerCase()} and can't borrow.`
      : !rule
        ? `There's no membership rule for ${memberTypePlural(member.member_type).toLowerCase()} yet.`
        : theirs.length >= rule.max_books_allowed
          ? `${member.name} already has ${theirs.length} book${theirs.length === 1 ? '' : 's'}, the most allowed.`
          : owed >= FINE_BLOCK
            ? `${member.name} owes ${rupees(owed)} in fines — collect it first.`
            : null;

  const lend = useMutation({
    mutationFn: () => createIssue({ copy_id: picked!.copy.copy_id, member_id: member!.member_id, issued_by: librarianId }),
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success(`Lent “${picked!.book.title}” to ${member!.name}`);
      setLastLent({ issueId: issue?.issue_id, title: picked!.book.title, name: member!.name, due: issue?.due_date ?? due ?? '' });
      setPicked(null);
      setMember(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not lend the book')),
  });

  return (
    <div className="space-y-5">
      {lastLent && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-5 w-5" />
          <span>
            Lent <strong>{lastLent.title}</strong> to <strong>{lastLent.name}</strong>
            {lastLent.due && <> — due {longDate(lastLent.due)}</>}.
          </span>
          {lastLent.issueId && (
            <Link to={`/library/issues/${lastLent.issueId}`} className="font-semibold underline">
              View loan
            </Link>
          )}
          <button type="button" onClick={() => setLastLent(null)} aria-label="Dismiss" className="ml-auto rounded-lg p-1 hover:bg-emerald-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${cardClass} space-y-4`}>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-xs text-white">1</span>
            <BookOpen className="h-4 w-4 text-brand-navy" /> Which copy?
          </h2>
          <CopyPicker value={picked} onChange={setPicked} initialBookId={initialBookId} onSwitchToReturn={onSwitchToReturn} />
        </section>

        <section className={`${cardClass} space-y-4`}>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-xs text-white">2</span>
            <UserRound className="h-4 w-4 text-brand-navy" /> Who is borrowing?
          </h2>
          <MemberPicker value={member} onChange={setMember} />
          {member && (
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                <p className="text-xs text-slate-500">Has now</p>
                <p className="font-semibold text-slate-900">
                  {theirs.length}
                  {rule && <span className="font-normal text-slate-400"> / {rule.max_books_allowed}</span>}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                <p className="text-xs text-slate-500">Late</p>
                <p className={`font-semibold ${late ? 'text-red-600' : 'text-slate-900'}`}>{late}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-2 py-2.5">
                <p className="text-xs text-slate-500">Owes</p>
                <p className={`font-semibold ${owed ? 'text-red-600' : 'text-slate-900'}`}>{rupees(owed)}</p>
              </div>
            </div>
          )}
          {problem && <NextStep tone="bad">{problem}</NextStep>}
        </section>
      </div>

      <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        {picked && member && !problem && due && (
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{picked.book.title}</span> to <span className="font-semibold text-slate-900">{member.name}</span>, due back{' '}
            <span className="font-semibold text-slate-900">{longDate(due)}</span>.
          </p>
        )}
        <button type="button" onClick={() => lend.mutate()} disabled={!picked || !member || Boolean(problem) || lend.isPending} className={btnPrimary}>
          <BookCheck className="h-4 w-4" /> {lend.isPending ? 'Lending…' : 'Lend book'}
        </button>
      </div>
    </div>
  );
}

// Scan a copy's barcode, or search a title and pick one of its free copies.
function CopyPicker({ value, onChange, initialBookId, onSwitchToReturn }: { value: Picked | null; onChange: (p: Picked | null) => void; initialBookId: string | null; onSwitchToReturn: () => void }) {
  const [code, setCode] = useState('');
  const [query, setQuery] = useState('');
  const [bookId, setBookId] = useState<string | null>(initialBookId);
  const [notFree, setNotFree] = useState<BookCopy | null>(null);
  const [reserveFor, setReserveFor] = useState<Pick<Book, 'book_id' | 'title'> | null>(null);
  const { data: books = [] } = useQuery({ queryKey: ['library', 'books'], queryFn: getBooks });
  const { data: book } = useQuery({ queryKey: ['library', 'book', bookId], queryFn: () => getBook(bookId!), enabled: Boolean(bookId) });
  const { data: copies = [] } = useQuery({ queryKey: ['library', 'copies', bookId], queryFn: () => getBookCopies(bookId!), enabled: Boolean(bookId) });

  const scan = useMutation({
    mutationFn: (barcode: string) => scanCopyByBarcode(barcode),
    onSuccess: (copy) => {
      setCode('');
      if (copy.status !== 'available') {
        setNotFree(copy);
        return;
      }
      setNotFree(null);
      onChange({ copy, book: { book_id: copy.book?.book_id ?? copy.book_id, title: copy.book?.title ?? 'Book', author: copy.book?.author ?? '', cover_image_url: null } });
    },
  });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return books.filter((b) => [b.title, b.author, b.isbn].some((v) => v?.toLowerCase().includes(q))).slice(0, 6);
  }, [books, query]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-brand/5 px-4 py-3 ring-1 ring-brand/20">
        <BookCover src={value.book.cover_image_url} title={value.book.title} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{value.book.title}</p>
          <p className="text-xs text-slate-500">
            Copy {value.copy.barcode}
            {value.copy.rack_location ? ` · shelf ${value.copy.rack_location}` : ''}
          </p>
        </div>
        <button type="button" onClick={() => onChange(null)} aria-label="Choose another copy" className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const free = copies.filter((c) => c.status === 'available');

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) scan.mutate(code.trim());
        }}
        className="relative"
      >
        <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Scan the copy's barcode, then Enter" autoFocus autoComplete="off" className={`${inputClass} pl-9`} />
      </form>
      {scan.isError && <p className="text-xs text-red-600">No copy has that barcode.</p>}
      {notFree && (
        <NextStep tone="bad">
          Copy {notFree.barcode} of “{notFree.book?.title}” is {copyStatusInfo(notFree.status).label.toLowerCase()}.{' '}
          {notFree.status === 'issued' && (
            <button type="button" onClick={onSwitchToReturn} className="font-semibold underline">
              Take it back instead
            </button>
          )}
        </NextStep>
      )}

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or find the title <span className="h-px flex-1 bg-slate-200" />
      </div>

      {bookId && book ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">{book.title}</span>
            <button type="button" onClick={() => setBookId(null)} className="ml-auto text-xs font-medium text-slate-500 hover:text-slate-800">
              Pick another title
            </button>
          </div>
          {free.length === 0 ? (
            <NextStep>
              No copy is on the shelf right now.{' '}
              <button type="button" onClick={() => setReserveFor(book)} className="font-semibold underline">
                Reserve it for someone
              </button>
            </NextStep>
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              {free.map((c) => (
                <li key={c.copy_id}>
                  <button type="button" onClick={() => onChange({ copy: c, book })} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                    <span className="font-mono font-medium text-slate-900">{c.barcode}</span>
                    <span className="text-xs text-slate-500">{c.rack_location ? `Shelf ${c.rack_location}` : ''}</span>
                    <span className="ml-auto">
                      <StatusPill label="On the shelf" color="#15936a" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, author or ISBN" autoComplete="off" className={`${inputClass} pl-9`} />
          </div>
          {query.trim() && (
            <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-200">
              {matches.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-500">No book matches “{query.trim()}”.</li>
              ) : (
                matches.map((b) => (
                  <li key={b.book_id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBookId(String(b.book_id));
                        setQuery('');
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <BookCover src={b.cover_image_url} title={b.title} size="sm" />
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-900">{b.title}</span>
                        <span className="block text-xs text-slate-500">{b.author}</span>
                      </span>
                      <span className="ml-auto">
                        <StatusPill label={b._count?.copies ? `${b._count.copies} free` : 'None free'} color={b._count?.copies ? '#15936a' : '#94a3b8'} />
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
      <ReserveDialog book={reserveFor} onClose={() => setReserveFor(null)} />
    </div>
  );
}

// Scan a copy that came back and take it in.
function ReturnPanel() {
  const [code, setCode] = useState('');
  const [issue, setIssue] = useState<BookIssue | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lastBack, setLastBack] = useState<string | null>(null);

  const scan = useMutation({
    mutationFn: async (barcode: string) => {
      const copy = await scanCopyByBarcode(barcode);
      if (!copy.current_issue_id) return { copy, issue: null };
      return { copy, issue: await getIssue(copy.current_issue_id) };
    },
    onSuccess: ({ copy, issue: found }) => {
      setCode('');
      if (!found) {
        setMessage(`Copy ${copy.barcode} of “${copy.book?.title ?? 'this book'}” isn't lent to anyone — it's ${copyStatusInfo(copy.status).label.toLowerCase()}.`);
        return;
      }
      setMessage(null);
      setIssue(found);
    },
    onError: () => setMessage('No copy has that barcode.'),
  });

  return (
    <section className={`${cardClass} max-w-2xl space-y-4`}>
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <ScanLine className="h-4 w-4 text-brand-navy" /> Scan the book that came back
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) scan.mutate(code.trim());
        }}
        className="flex gap-2"
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Barcode, then Enter" autoFocus autoComplete="off" className={`${inputClass} py-3 text-base`} />
        <button type="submit" disabled={!code.trim() || scan.isPending} className={btnPrimary}>
          {scan.isPending ? 'Finding…' : 'Find'}
        </button>
      </form>
      {message && <NextStep tone="bad">{message}</NextStep>}
      {lastBack && !message && <NextStep tone="good">{lastBack}</NextStep>}
      <ReturnDialog
        issue={issue}
        onClose={() => setIssue(null)}
        onDone={() => setLastBack(`“${issue?.copy?.book?.title ?? 'Book'}” is back from ${issue?.member?.name ?? 'the member'}. Scan the next one.`)}
      />
    </section>
  );
}
