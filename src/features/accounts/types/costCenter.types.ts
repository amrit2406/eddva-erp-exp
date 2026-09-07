export interface CostCenter {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CostCenterFormData {
  name: string;
  isActive: boolean;
}

export type CostCenterUpdateData = CostCenterFormData;
