import axiosInstance from '../../../lib/axios';
import type { AdmissionLoginCredentials, AdmissionPlatformUser } from '../types/admission.types';

interface AdmissionLoginResponse {
  admission_token: string;
  user: AdmissionPlatformUser;
  redirect?: string;
}

export async function admissionLoginApi(credentials: AdmissionLoginCredentials): Promise<AdmissionLoginResponse> {
  const { institute_id, ...rest } = credentials;
  const payload = institute_id?.trim() ? { ...rest, institute_id: institute_id.trim() } : rest;
  const response = await axiosInstance.post('/admission/auth/login', payload);
  return response.data.data;
}
