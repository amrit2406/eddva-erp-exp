import axiosInstance from '../../../lib/axios';
import type { CanteenLoginCredentials, CanteenPlatformUser } from '../types/canteen.types';

interface CanteenLoginResponse {
  canteen_token: string;
  user: CanteenPlatformUser;
  redirect?: string;
}

export async function canteenLoginApi(credentials: CanteenLoginCredentials): Promise<CanteenLoginResponse> {
  const response = await axiosInstance.post('/canteen/auth/login', credentials);
  return response.data.data;
}
