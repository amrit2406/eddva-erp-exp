import axiosInstance from '../../../lib/axios';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data.data;
};

export const logoutApi = async (): Promise<void> => {
  // This will call the real API: POST /auth/logout
  await new Promise((resolve) => setTimeout(resolve, 500));
};
