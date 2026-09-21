import axiosInstance from '../../../lib/axios';

export const hostelSsoApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.get('/hostel/auth/sso');
  return response.data.data || response.data;
};
