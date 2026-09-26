import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Info,
  PackagePlus,
  Pencil,
  Send,
  Truck,
  Warehouse,
  XCircle,
} from 'lucide-react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import { ChartCard } from '../../../../components/premium/charts';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useToast } from '../../../../hooks/useToast';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import PoItems from '../../components/purchase-orders/PoItems';
import PoProgress from '../../components/purchase-orders/PoProgress';
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrder,
  rejectPurchaseOrder,
  submitPurchaseOrder,
} from '../../api/sales-purchase.api';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { awaitingDelivery, canEditPo, poStatusInfo } from '../../utils/poStatus';

const DAY_MS = 24 * 60 * 60 * 1000;

const longDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// What this status means for the person looking at it, and what to do next.
function nextStep(po: PurchaseOrder): { text: string; tone: 'info' | 'good' | 'bad' } {
  switch (po.status) {
    case 'DRAFT':
      return { text: "This order hasn't been sent yet. Check the items below, then send it for approval.", tone: 'info' };
    case 'PENDING_APPROVAL':
      return { text: 'Waiting for a manager to approve or reject it.', tone: 'info' };
    case 'APPROVED':
      return { text: 'Approved. When the goods arrive, record them as a goods receipt (GRN).', tone: 'good' };
    case 'PARTIALLY_RECEIVED':
      return { text: 'Some goods have arrived. Record the rest as they come in.', tone: 'good' };
    case 'CLOSED':
      return { text: 'All goods have been received. Nothing left to do.', tone: 'good' };
    case 'REJECTED':
      return {
        text: po.rejection_reason ? `Rejected: “${po.rejection_reason}”. Create a new order if it's still needed.` : "Rejected. Create a new order if it's still needed.",
        tone: 'bad',
      };
    case 'CANCELLED':
      return { text: 'This order was cancelled and will not go ahead.', tone: 'bad' };
    default:
      return { text: '', tone: 'info' };
  }
}

const TONE_STYLE = {
  info: { background: 'rgb(0 139 233 / 0.07)', color: '#0a4a9c', icon: Info },
  good: { background: 'rgb(12 163 12 / 0.07)', color: '#166534', icon: CheckCircle2 },
  bad: { background: 'rgb(208 59 59 / 0.07)', color: '#991b1b', icon: AlertTriangle },
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-5 w-36 rounded" />
      <div className="h-44 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton mt-3 h-4 w-72 rounded" />
        <div className="skeleton mt-6 h-10 w-full rounded-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-72 rounded-3xl lg:col-span-2" />
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    </div>
  );
}

type Action = 'submit' | 'approve' | 'reject' | 'cancel';

export default function PurchaseOrderDetailsPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const { data: po, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'purchase-order', id],
    queryFn: () => getPurchaseOrder(id),
    enabled: Boolean(id),
  });

  const act = useMutation({
    mutationFn: ({ action }: { action: Action }) => {
      switch (action) {
        case 'submit':
          return submitPurchaseOrder(id);
        case 'approve':
          return approvePurchaseOrder(id);
        case 'reject':
          return rejectPurchaseOrder(id, reason.trim() || undefined);
        case 'cancel':
          return cancelPurchaseOrder(id);
      }
    },
    onSuccess: (_, { action }) => {
      const done = { submit: 'Sent for approval', approve: 'Order approved', reject: 'Order rejected', cancel: 'Order cancelled' }[action];
      toast.success(`${po?.po_number ?? 'Order'}: ${done.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'dashboard'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'That action could not be completed')),
    onSettled: () => {
      setConfirmCancel(false);
      setRejecting(false);
      setReason('');
    },
  });

  const back = (
    <Link to="/sales-purchase/purchase-orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
      <ArrowLeft className="h-4 w-4" /> Purchase orders
    </Link>
  );

  if (isLoading) return <DetailsSkeleton />;
  if (error || !po) {
    return (
      <div className="space-y-4">
        {back}
        <ErrorState message={getApiErrorMessage(error, 'Failed to load purchase order')} onRetry={() => refetch()} />
      </div>
    );
  }

  const status = poStatusInfo(po.status);
  const StatusIcon = status.icon;
  const step = nextStep(po);
  const tone = TONE_STYLE[step.tone];
  const busy = act.isPending;
  const items = po.items ?? [];
  const ordered = items.reduce((sum, line) => sum + toNumber(line.quantity), 0);
  const received = items.reduce((sum, line) => sum + toNumber(line.received_qty), 0);
  const vendor = po.vendor;
  const vendorAddress = vendor ? [vendor.address_line1, vendor.address_line2, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(', ') : '';

  let deliveryNote: { text: string; late: boolean } | null = null;
  if (po.expected_delivery_date && awaitingDelivery(po.status)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(po.expected_delivery_date);
    due.setHours(0, 0, 0, 0);
    const days = Math.round((today.getTime() - due.getTime()) / DAY_MS);
    deliveryNote =
      days > 0
        ? { text: `Late by ${days} day${days === 1 ? '' : 's'}`, late: true }
        : days === 0
          ? { text: 'Due today', late: false }
          : { text: `In ${-days} day${days === -1 ? '' : 's'}`, late: false };
  }

  const primary = 'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110 disabled:opacity-60';
  const secondary = 'inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60';
  const quiet = 'inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60';

  return (
    <div className="space-y-5">
      {back}

      {/* Header: what, who, how much, where it stands, what to do. */}
      <section className="animate-rise relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
        <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: status.color }} />
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{po.po_number}</h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                  style={{ background: `${status.color}1a`, color: status.color === '#94a3b8' ? '#64748b' : status.color }}
                >
                  <StatusIcon className="h-4 w-4" /> {status.label}
                </span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4" /> {vendor?.vendor_name ?? 'Unknown vendor'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Ordered {po.po_date ? longDate(po.po_date) : '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4" /> {items.length} item{items.length === 1 ? '' : 's'} · FY {po.financial_year}
                </span>
              </p>
            </div>
            <div className="lg:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Order total</p>
              <p className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{rupees(toNumber(po.grand_total))}</p>
              <p className="text-xs text-slate-400">including tax</p>
            </div>
          </div>

          {step.text && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm" style={{ background: tone.background, color: tone.color }}>
              <tone.icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{step.text}</p>
            </div>
          )}

          {/* Only the actions that make sense right now. */}
          {(po.status === 'DRAFT' || po.status === 'PENDING_APPROVAL' || awaitingDelivery(po.status)) && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {po.status === 'DRAFT' && (
                <>
                  <button type="button" className={primary} disabled={busy} onClick={() => act.mutate({ action: 'submit' })}>
                    <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Send for approval'}
                  </button>
                  {canEditPo(po.status) && (
                    <Link to={`/sales-purchase/purchase-orders/${po.po_id}/edit`} className={secondary}>
                      <Pencil className="h-4 w-4" /> Edit order
                    </Link>
                  )}
                </>
              )}
              {po.status === 'PENDING_APPROVAL' && (
                <>
                  <button type="button" className={primary} disabled={busy} onClick={() => act.mutate({ action: 'approve' })}>
                    <CheckCircle2 className="h-4 w-4" /> {busy ? 'Saving…' : 'Approve'}
                  </button>
                  <button type="button" className={secondary} disabled={busy} onClick={() => setRejecting(true)}>
                    <XCircle className="h-4 w-4 text-red-600" /> Reject
                  </button>
                </>
              )}
              {awaitingDelivery(po.status) && (
                <Link to={`/sales-purchase/grn/new?po=${po.po_id}`} className={primary}>
                  <PackagePlus className="h-4 w-4" /> Record goods received
                </Link>
              )}
              {(po.status === 'DRAFT' || po.status === 'PENDING_APPROVAL') && (
                <button type="button" className={quiet} disabled={busy} onClick={() => setConfirmCancel(true)}>
                  <Ban className="h-4 w-4" /> Cancel order
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
          <PoProgress po={po} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <ChartCard
            title="Items ordered"
            subtitle={ordered > 0 ? `${received.toLocaleString('en-IN')} of ${ordered.toLocaleString('en-IN')} units received` : undefined}
            icon={ClipboardList}
          >
            <PoItems items={items} />
          </ChartCard>
        </div>

        <div className="space-y-5">
          <ChartCard title="Amount" icon={FaIndianRupeeSign} style={{ animationDelay: '50ms' }}>
            <dl className="divide-y divide-slate-100">
              <Row label="Items total">{rupees(toNumber(po.subtotal))}</Row>
              {toNumber(po.discount) > 0 && <Row label="Discount">− {rupees(toNumber(po.discount))}</Row>}
              <Row label="Tax">{rupees(toNumber(po.tax_amount))}</Row>
            </dl>
            <div className="mt-2 flex items-baseline justify-between rounded-2xl bg-brand-navy px-4 py-3 text-white">
              <span className="text-sm text-sky-100">Order total</span>
              <span className="text-xl font-semibold tabular-nums">{rupees(toNumber(po.grand_total))}</span>
            </div>
          </ChartCard>

          <ChartCard
            title="Vendor"
            icon={Truck}
            style={{ animationDelay: '100ms' }}
            action={
              vendor && (
                <Link to={`/sales-purchase/vendors/${vendor.vendor_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-navy">
                  Open <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )
            }
          >
            {vendor ? (
              <dl className="divide-y divide-slate-100">
                <Row label="Name">{vendor.vendor_name}</Row>
                <Row label="Code">{vendor.vendor_code}</Row>
                {vendor.gstin && <Row label="GSTIN">{vendor.gstin}</Row>}
                {vendorAddress && <Row label="Address">{vendorAddress}</Row>}
              </dl>
            ) : (
              <p className="text-sm text-slate-500">Vendor details aren't available.</p>
            )}
          </ChartCard>

          <ChartCard title="Delivery" icon={Warehouse} style={{ animationDelay: '150ms' }}>
            <dl className="divide-y divide-slate-100">
              <Row label="Deliver to">{po.warehouse?.name ?? '—'}</Row>
              {po.warehouse?.address && <Row label="Address">{po.warehouse.address}</Row>}
              <Row label="Expected by">
                {po.expected_delivery_date ? longDate(po.expected_delivery_date) : 'Not set'}
                {deliveryNote && (
                  <span className={`block text-xs ${deliveryNote.late ? 'font-semibold text-red-600' : 'font-normal text-slate-500'}`}>{deliveryNote.text}</span>
                )}
              </Row>
            </dl>
          </ChartCard>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmCancel}
        onClose={() => !busy && setConfirmCancel(false)}
        onConfirm={() => act.mutate({ action: 'cancel' })}
        title="Cancel this purchase order?"
        message={`${po.po_number} for ${vendor?.vendor_name ?? 'this vendor'} will be stopped and can't be sent or approved afterwards.`}
        confirmText={busy ? 'Cancelling…' : 'Cancel order'}
        cancelText="Keep order"
      />

      <Modal isOpen={rejecting} onClose={() => !busy && setRejecting(false)} title="Reject this purchase order?" size="md">
        <p className="text-sm text-slate-600">
          {po.po_number} won't go ahead. Tell the person who raised it why, so they can fix it or raise a new one.
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="reject-reason">
          Reason <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Price is higher than the last order"
          className="mt-1.5 w-full rounded-xl px-3 py-2 text-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRejecting(false)} disabled={busy}>
            Keep waiting
          </Button>
          <Button variant="danger" onClick={() => act.mutate({ action: 'reject' })} disabled={busy}>
            {busy ? 'Rejecting…' : 'Reject order'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
