export type NotificationEntityType = 'visitor' | 'enquiry' | 'appointment' | 'complaint';
export type NotificationChannel = 'sms' | 'email' | 'push';
export type NotificationStatus = 'queued' | 'sent' | 'failed';

export interface FrontOfficeNotification {
  notification_id: number;
  entity_type: NotificationEntityType;
  entity_id: number;
  event_type: string;
  recipient_employee_id?: number | null;
  recipient?: {
    employee_id: number;
    name: string;
    email: string;
  } | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  message?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface NotificationFilters {
  entityType?: NotificationEntityType;
  entityId?: number;
  recipientEmployeeId?: number;
}
