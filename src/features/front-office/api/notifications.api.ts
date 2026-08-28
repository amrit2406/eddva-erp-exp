import axiosInstance from '../../../lib/axios';
import type { FrontOfficeNotification, NotificationFilters } from '../types/notification.types';

export async function getNotifications(filters?: NotificationFilters): Promise<FrontOfficeNotification[]> {
  const response = await axiosInstance.get('/front-office/notifications', {
    params: filters
      ? {
          entityType: filters.entityType,
          entityId: filters.entityId,
          recipientEmployeeId: filters.recipientEmployeeId,
        }
      : undefined,
  });
  return response.data.data || response.data || [];
}
