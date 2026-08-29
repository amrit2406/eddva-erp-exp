import axios from 'axios';
import { config } from '../../../config/env';
import type { KioskAppointmentLookup, KioskCheckInResult } from '../types/kiosk.types';

// Deliberately a bare axios client, not the shared authenticated `axiosInstance` — the
// kiosk endpoints take no Bearer token by design (a lobby tablet is not a logged-in staff
// member), and a public kiosk page should never carry the app's private token at all.
const kioskAxios = axios.create({ baseURL: config.apiUrl });

export async function lookupKioskAppointment(
  appointmentId: string | number,
  phone: string
): Promise<KioskAppointmentLookup> {
  const response = await kioskAxios.get(`/front-office/kiosk/appointments/${appointmentId}`, {
    params: { phone },
  });
  return response.data.data || response.data;
}

export async function kioskCheckIn(appointmentId: string | number, phone: string): Promise<KioskCheckInResult> {
  const response = await kioskAxios.post(`/front-office/kiosk/appointments/${appointmentId}/check-in`, { phone });
  return response.data.data || response.data;
}
