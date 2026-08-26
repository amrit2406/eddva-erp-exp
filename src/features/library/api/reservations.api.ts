import axiosInstance from '../../../lib/axios';
import type { Reservation, ReservationFormData, ReservationStatus } from '../types/library.types';

export async function reserveBook(bookId: string | number, data: ReservationFormData): Promise<Reservation> {
  const response = await axiosInstance.post(`/library/books/${bookId}/reserve`, data);
  return response.data.data || response.data;
}

export async function cancelReservation(id: string | number): Promise<Reservation> {
  const response = await axiosInstance.post(`/library/reservations/${id}/cancel`);
  return response.data.data || response.data;
}

export async function getReservations(status?: ReservationStatus): Promise<Reservation[]> {
  const response = await axiosInstance.get('/library/reservations', { params: status ? { status } : undefined });
  return response.data.data || response.data || [];
}
