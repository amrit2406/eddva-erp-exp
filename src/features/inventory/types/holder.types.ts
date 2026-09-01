export type InventoryHolderType = 'staff' | 'student' | 'department';

export interface InventoryHolder {
  holder_id: number;
  holder_type: InventoryHolderType;
  name: string;
  external_ref_id?: string | null;
  contact_phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}
