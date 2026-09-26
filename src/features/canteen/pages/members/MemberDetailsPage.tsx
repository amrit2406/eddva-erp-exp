import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, IdCard, Pencil, Plus, UserRound, Wallet } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { DetailHeader, DetailSkeleton, InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { btnPrimary, btnSecondary, longDate, shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getMember, getOrders } from '../../api/canteen.api';
import { getApiErrorMessage } from '../../utils/errors';
import { memberTypeInfo, orderStatusInfo, shortRef } from '../../utils/labels';

const RECENT = 6;

export default function MemberDetailsPage() {
  const { id = '' } = useParams();
  const { data: member, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'member', id], queryFn: () => getMember(id), enabled: Boolean(id) });
  const { data: orders = [] } = useQuery({ queryKey: ['canteen', 'orders'], queryFn: () => getOrders() });

  const back = (
    <Link to="/canteen/members" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Members
    </Link>
  );

  if (isLoading) return <DetailSkeleton />;
  if (error || !member) {
    return (
      <div className="space-y-5">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load member')} onRetry={() => refetch()} />
      </div>
    );
  }

  const type = memberTypeInfo(member.memberType);
  const wallet = member.wallet;
  const theirs = orders.filter((o) => o.memberId === member.id).sort((a, b) => (b.orderDate ?? b.createdAt).localeCompare(a.orderDate ?? a.createdAt));
  const spent = theirs.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + toNumber(o.totalAmount), 0);

  return (
    <div className="space-y-5">
      {back}
      <DetailHeader
        icon={UserRound}
        title={member.name}
        status={<StatusPill label={type.label} color={type.color} />}
        meta={`Member since ${longDate(member.createdAt)}`}
        actions={
          <>
            <Link to={`/canteen/orders/new?memberId=${member.id}`} className={btnPrimary}>
              <Plus className="h-4 w-4" /> New order
            </Link>
            <Link to={`/canteen/members/${member.id}/edit`} className={btnSecondary}>
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <InfoCard
            title="ID details"
            icon={IdCard}
            rows={[
              ['ID card number', <span className="font-mono text-xs">{member.idCardBarcode}</span>],
              [member.memberType === 'STUDENT' ? 'Admission / roll no.' : 'School ID', member.externalRefId || '—'],
              ['Orders so far', `${theirs.length}`],
              ['Spent so far', rupees(spent)],
            ]}
          />
          <InfoCard
            title="Wallet"
            icon={Wallet}
            delay={60}
            action={
              wallet && (
                <Link to={`/canteen/members/${member.id}/wallet`} className="text-sm font-medium text-brand hover:text-brand-navy">
                  Open
                </Link>
              )
            }
          >
            {wallet ? (
              <div>
                <p className="text-3xl font-semibold tabular-nums text-slate-900">{rupees(toNumber(wallet.balance))}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Can spend up to {rupees(toNumber(wallet.dailySpendLimit))} a day
                </p>
                {wallet.status === 'BLOCKED' && <p className="mt-2 text-sm font-medium text-red-600">Blocked — can't pay with the wallet right now.</p>}
                <Link to={`/canteen/wallets/${wallet.id}/topups`} className={`${btnSecondary} mt-4 w-full`}>
                  <Plus className="h-4 w-4" /> Add money
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">No wallet yet. With a wallet, {member.name.split(' ')[0]} can pay using their ID card.</p>
                <Link to={`/canteen/members/${member.id}/wallet`} className={btnSecondary}>
                  <Wallet className="h-4 w-4" /> Set up wallet
                </Link>
              </div>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-2">
          <InfoCard title={`Orders · ${theirs.length}`} icon={ClipboardList} delay={90}>
            {theirs.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {theirs.slice(0, RECENT).map((o) => {
                  const s = orderStatusInfo(o.status);
                  return (
                    <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
                      <Link to={`/canteen/orders/${o.id}`} className="font-medium text-brand-navy hover:text-brand">
                        {o.orderNumber ?? shortRef(o.id)}
                      </Link>
                      <span className="hidden text-slate-500 sm:block">
                        {o.items.length} item{o.items.length === 1 ? '' : 's'}
                      </span>
                      <span className="ml-auto whitespace-nowrap text-xs text-slate-400">{shortDate(o.orderDate ?? o.createdAt)}</span>
                      <span className="whitespace-nowrap font-medium tabular-nums text-slate-900">{rupees(toNumber(o.totalAmount))}</span>
                      <StatusPill label={s.label} color={s.color} />
                    </li>
                  );
                })}
              </ul>
            )}
            {theirs.length > RECENT && (
              <Link to="/canteen/orders" className="mt-3 inline-block text-sm font-medium text-brand hover:text-brand-navy">
                See all orders
              </Link>
            )}
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
