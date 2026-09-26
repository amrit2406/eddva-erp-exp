import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Plus, ScanLine, UserRound, Wallet } from 'lucide-react';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { btnPrimary, btnSecondary, cardClass, inputClass } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getMemberByBarcode } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { memberTypeInfo } from '../../utils/labels';

export default function MemberLookupPage() {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lookup = useMutation({
    mutationFn: (code: string) => getMemberByBarcode(code),
    // Ready for the next scan straight away.
    onSettled: () => inputRef.current?.select(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) lookup.mutate(barcode.trim());
  };

  const member = lookup.data;
  const notFound = (lookup.error as { response?: { status?: number } } | null)?.response?.status === 404;

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/members', label: 'Members' }} title="Find by ID card" subtitle="Scan a card or type its number to find the member." />

      <form onSubmit={handleSearch} className={`${cardClass} max-w-2xl`}>
        <label htmlFor="barcode" className="mb-1.5 block text-sm font-medium text-slate-700">
          ID card number
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan now, or type e.g. BC1001"
              autoFocus
              autoComplete="off"
              className={`${inputClass} py-3 pl-10 text-base`}
            />
          </div>
          <button type="submit" disabled={!barcode.trim() || lookup.isPending} className={btnPrimary}>
            {lookup.isPending ? 'Finding…' : 'Find'}
          </button>
        </div>

        {lookup.isError && (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {notFound ? `No member has the ID card “${lookup.variables}”. Check the number, or add them as a new member.` : getApiErrorMessage(lookup.error, 'Could not look up this card')}
            {notFound && (
              <Link to="/canteen/members/new" className="ml-2 font-semibold underline">
                Add member
              </Link>
            )}
          </p>
        )}
      </form>

      {member && (
        <section className={`${cardClass} animate-rise max-w-2xl`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand shadow-md shadow-brand/25">
              <UserRound className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">{member.name}</h2>
                <StatusPill label={memberTypeInfo(member.memberType).label} color={memberTypeInfo(member.memberType).color} />
              </div>
              <p className="text-sm text-slate-500">
                {member.externalRefId} · Card {member.idCardBarcode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Wallet</p>
              {member.wallet ? (
                <>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">{rupees(toNumber(member.wallet.balance))}</p>
                  {member.wallet.status === 'BLOCKED' && <p className="text-xs font-medium text-red-600">Blocked</p>}
                </>
              ) : (
                <p className="text-sm text-slate-400">None</p>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={`/canteen/orders/new?memberId=${member.id}`} className={btnPrimary}>
              <Plus className="h-4 w-4" /> New order
            </Link>
            <Link to={`/canteen/members/${member.id}/wallet`} className={btnSecondary}>
              <Wallet className="h-4 w-4" /> {member.wallet ? 'Wallet' : 'Set up wallet'}
            </Link>
            <Link to={`/canteen/members/${member.id}`} className={btnSecondary}>
              Member details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
