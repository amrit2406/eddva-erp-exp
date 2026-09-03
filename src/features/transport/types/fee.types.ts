import type { TransportRoute } from './route.types';

export type TransportFeePlanBasis = 'route' | 'flat';
export type TransportFeeBillingCycle = 'monthly' | 'quarterly' | 'annually';

export interface TransportFeePlan {
  fee_plan_id: number;
  institute_id: string;
  name: string;
  basis: TransportFeePlanBasis | string;
  route_id?: number | null;
  route?: TransportRoute | null;
  amount: string | number;
  billing_cycle: TransportFeeBillingCycle | string;
  created_at: string;
  updated_at: string;
}

export interface TransportFeePlanFormData {
  name: string;
  basis: TransportFeePlanBasis;
  route_id?: number;
  amount: number;
  billing_cycle: TransportFeeBillingCycle;
}

export type TransportSubscriptionStatus = 'active' | 'ended' | 'cancelled';

export interface TransportFeeSubscription {
  subscription_id: number;
  passenger_id: number;
  fee_plan_id: number;
  start_date: string;
  end_date?: string | null;
  status: TransportSubscriptionStatus | string;
  created_at: string;
  updated_at: string;
  fee_plan?: TransportFeePlan;
}

export interface TransportSubscribeFormData {
  fee_plan_id: number;
  start_date: string;
  status: TransportSubscriptionStatus;
}

export interface TransportFeePayment {
  payment_id: number;
  subscription_id: number;
  amount_paid: string | number;
  payment_date: string;
  payment_mode: string;
  transaction_ref?: string | null;
  status: string;
  invoice_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransportFeePaymentFormData {
  amount_paid: number;
  payment_date: string;
  payment_mode: string;
  transaction_ref?: string;
  invoice_id?: string;
}
