export type InventoryIssueStatus = 'pending_approval' | 'issued' | 'partially_returned' | 'returned' | 'overdue' | 'rejected';
export type InventoryApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected';
export type InventoryReturnCondition = 'good' | 'damaged' | 'unusable';

interface IssueItemRef {
  item_id: number;
  name: string;
  item_code: string;
  item_type: 'consumable' | 'asset';
}

interface IssueAssetUnitRef {
  asset_unit_id: number;
  asset_tag: string;
  status: string;
}

interface IssueHolderRef {
  holder_id: number;
  name: string;
  holder_type: 'staff' | 'student' | 'department';
}

interface IssueLocationRef {
  location_id: number;
  name: string;
}

export interface InventoryReturnRecord {
  return_id: number;
  issue_id: number;
  quantity_returned: number;
  condition: InventoryReturnCondition;
  remarks?: string | null;
  return_date: string;
  received_by?: string | null;
  created_at: string;
}

export interface InventoryIssue {
  issue_id: number;
  item_id: number;
  item?: IssueItemRef;
  asset_unit_id?: number | null;
  asset_unit?: IssueAssetUnitRef | null;
  quantity: number;
  quantity_returned: number;
  holder_id: number;
  holder?: IssueHolderRef;
  source_location_id: number;
  source_location?: IssueLocationRef;
  issue_date: string;
  expected_return_date?: string | null;
  status: InventoryIssueStatus;
  approval_status: InventoryApprovalStatus;
  approval_rule_id?: number | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  issued_by?: string | null;
  created_at: string;
  updated_at: string;
  returns?: InventoryReturnRecord[];
}

export interface InventoryIssueFormData {
  item_id: number;
  asset_unit_id?: number;
  quantity?: number;
  holder_id: number;
  source_location_id: number;
  issue_date: string;
  expected_return_date?: string;
}

export interface InventoryReturnFormData {
  quantity_returned?: number;
  condition: InventoryReturnCondition;
  remarks?: string;
  return_date?: string;
}

export interface InventoryRejectFormData {
  rejection_reason: string;
}

export interface InventoryIssuePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryIssueQueryParams {
  item_id?: number;
  holder_id?: number;
  location_id?: number;
  status?: InventoryIssueStatus;
  approval_status?: InventoryApprovalStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InventoryIssueListResult {
  data: InventoryIssue[];
  pagination: InventoryIssuePagination;
}

// ─── Approval Rules ───────────────────────────────────────────────────────

interface ApprovalRuleCategoryRef {
  category_id: number;
  name: string;
}

export interface InventoryApprovalRule {
  rule_id: number;
  category_id?: number | null;
  category?: ApprovalRuleCategoryRef | null;
  value_threshold?: number | null;
  quantity_threshold?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryApprovalRuleFormData {
  category_id?: number;
  value_threshold?: number;
  quantity_threshold?: number;
  is_active?: boolean;
}
