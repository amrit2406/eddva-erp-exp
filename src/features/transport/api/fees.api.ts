import axiosInstance from '../../../lib/axios';
import type {
  TransportFeePlan,
  TransportFeePlanFormData,
  TransportFeeSubscription,
  TransportFeePayment,
  TransportFeePaymentFormData,
} from '../types/fee.types';

export async function getFeePlans(): Promise<TransportFeePlan[]> {
  const response = await axiosInstance.get('/transport/fees/plans');
  return response.data.data || response.data || [];
}

export async function createFeePlan(data: TransportFeePlanFormData): Promise<TransportFeePlan> {
  const response = await axiosInstance.post('/transport/fees/plans', data);
  return response.data.data || response.data;
}

export async function subscribePassengerToPlan(
  passengerId: string | number,
  planId: string | number,
  data: { start_date: string; status: string }
): Promise<TransportFeeSubscription> {
  const response = await axiosInstance.post(
    `/transport/fees/passengers/${passengerId}/subscriptions/${planId}`,
    data
  );
  return response.data.data || response.data;
}

export async function getPassengerSubscriptions(
  passengerId: string | number
): Promise<TransportFeeSubscription[]> {
  const response = await axiosInstance.get(`/transport/fees/passengers/${passengerId}/subscriptions`);
  return response.data.data || response.data || [];
}

export async function getSubscriptionPayments(subscriptionId: string | number): Promise<TransportFeePayment[]> {
  const response = await axiosInstance.get(`/transport/fees/subscriptions/${subscriptionId}/payments`);
  return response.data.data || response.data || [];
}

export async function createSubscriptionPayment(
  subscriptionId: string | number,
  data: TransportFeePaymentFormData
): Promise<TransportFeePayment> {
  const response = await axiosInstance.post(`/transport/fees/subscriptions/${subscriptionId}/payments`, data);
  return response.data.data || response.data;
}
