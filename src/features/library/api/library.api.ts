import axiosInstance from '../../../lib/axios';
import type {
  Book,
  BookCopy,
  BookCopyFormData,
  BookCopyUpdateData,
  BookFormData,
  BookIssue,
  Category,
  CategoryFormData,
  Fine,
  Member,
  MemberFormData,
  MembershipRule,
  MembershipRuleFormData,
  Permission,
  PermissionFormData,
  PermissionsCatalog,
  ResetPasswordFormData,
  ResetPasswordResponse,
  Role,
  RoleFormData,
  RolePermission,
  UserAssignment,
  UserAssignmentFormData,
} from '../types/library.types';
import { sanitizeRolePermissions } from '../utils/rbac.utils';

// Permissions Endpoints
export async function getPermissionsCatalog(): Promise<PermissionsCatalog> {
  const response = await axiosInstance.get('/library/roles/permissions/catalog');
  return response.data.data;
}

export async function getMyPermissions(): Promise<RolePermission[]> {
  const response = await axiosInstance.get('/library/roles/permissions/me');
  return response.data.data;
}

export async function getPermissions(): Promise<Permission[]> {
  const response = await axiosInstance.get('/library/permissions');
  // Handle catalog structure response
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  // Fallback for simple array response
  return response.data.data || response.data || [];
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const response = await axiosInstance.post('/library/permissions', data);
  return response.data.data || response.data;
}

export async function getPermission(id: string | number): Promise<Permission> {
  const response = await axiosInstance.get(`/library/permissions/${id}`);
  return response.data.data || response.data;
}

export async function updatePermission(id: string | number, data: Partial<PermissionFormData>): Promise<Permission> {
  const response = await axiosInstance.patch(`/library/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/permissions/${id}`);
}

// Role Management Endpoints
export async function getRoles(): Promise<Role[]> {
  const response = await axiosInstance.get('/library/roles');
  return response.data.data;
}

export async function getRole(id: string | number): Promise<Role> {
  const response = await axiosInstance.get(`/library/roles/${id}`);
  return response.data.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await axiosInstance.post('/library/roles', {
    ...data,
    permissions: sanitizeRolePermissions(data.permissions),
  });
  return response.data.data;
}

export async function updateRole(id: string | number, data: Partial<RoleFormData>): Promise<Role> {
  const payload = { ...data };
  if (data.permissions) {
    payload.permissions = sanitizeRolePermissions(data.permissions);
  }
  const response = await axiosInstance.patch(`/library/roles/${id}`, payload);
  return response.data.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/roles/${id}`);
}

// User Assignment Endpoints
export async function getUserAssignments(): Promise<UserAssignment[]> {
  const response = await axiosInstance.get('/library/roles/user-assignments');
  return response.data.data;
}

export async function createUserAssignment(data: UserAssignmentFormData): Promise<UserAssignment> {
  const response = await axiosInstance.post('/library/roles/user-assignments', data);
  return response.data.data;
}

export async function revokeUserAssignment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/roles/user-assignments/${id}`);
}

export async function resetUserAssignmentPassword(
  id: string | number,
  data: ResetPasswordFormData
): Promise<ResetPasswordResponse> {
  const response = await axiosInstance.patch(`/library/roles/user-assignments/${id}/password`, data);
  return response.data.data;
}

// Category Management Endpoints
export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get('/library/categories');
  return response.data.data || response.data || [];
}

export async function createCategory(data: CategoryFormData): Promise<Category> {
  const response = await axiosInstance.post('/library/categories', data);
  return response.data.data || response.data;
}

export async function getCategory(id: string | number): Promise<Category> {
  // Get all categories and find the specific one by ID
  const categories = await getCategories();
  const category = categories.find(c => c.category_id === Number(id));
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
}

export async function updateCategory(id: string | number, data: Partial<CategoryFormData>): Promise<Category> {
  const response = await axiosInstance.patch(`/library/categories/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteCategory(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/categories/${id}`);
}

// Membership Rule Management Endpoints
export async function getMembershipRules(): Promise<MembershipRule[]> {
  const response = await axiosInstance.get('/library/membership-rules');
  return response.data.data || response.data || [];
}

export async function createMembershipRule(data: MembershipRuleFormData): Promise<MembershipRule> {
  const response = await axiosInstance.post('/library/membership-rules', data);
  return response.data.data || response.data;
}

export async function getMembershipRule(id: string | number): Promise<MembershipRule> {
  // Get all rules and find the specific one by ID
  const rules = await getMembershipRules();
  const rule = rules.find(r => r.rule_id === Number(id));
  if (!rule) {
    throw new Error('Membership rule not found');
  }
  return rule;
}

export async function updateMembershipRule(id: string | number, data: Partial<MembershipRuleFormData>): Promise<MembershipRule> {
  const response = await axiosInstance.patch(`/library/membership-rules/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteMembershipRule(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/membership-rules/${id}`);
}

// Member Management Endpoints
export async function getMembers(): Promise<Member[]> {
  const response = await axiosInstance.get('/library/members');
  // Handle nested response structure: response.data.data.data
  const members = response.data.data?.data || [];
  return members;
}

export async function createMember(data: MemberFormData): Promise<Member> {
  const response = await axiosInstance.post('/library/members', data);
  return response.data.data || response.data;
}

export async function getMember(id: string | number): Promise<Member> {
  // Get all members and find the specific one by ID
  const members = await getMembers();
  const member = members.find(m => m.member_id === Number(id));
  if (!member) {
    throw new Error('Member not found');
  }
  return member;
}

export async function updateMember(id: string | number, data: Partial<MemberFormData>): Promise<Member> {
  const response = await axiosInstance.patch(`/library/members/${id}`, data);
  return response.data.data || response.data;
}

export async function getMemberCurrentIssues(id: string | number): Promise<BookIssue[]> {
  const response = await axiosInstance.get(`/library/members/${id}/current-issues`);
  return response.data.data || response.data || [];
}

export async function getMemberFines(id: string | number): Promise<Fine[]> {
  const response = await axiosInstance.get(`/library/members/${id}/fines`);
  return response.data.data || response.data || [];
}

// Book Management Endpoints
export async function getBooks(): Promise<Book[]> {
  const response = await axiosInstance.get('/library/books');
  return response.data.data?.data || [];
}

export async function createBook(data: BookFormData): Promise<Book> {
  const response = await axiosInstance.post('/library/books', data);
  return response.data.data || response.data;
}

export async function getBook(id: string | number): Promise<Book> {
  // Get all books and find the specific one by ID
  const books = await getBooks();
  const book = books.find(b => b.book_id === Number(id));
  if (!book) {
    throw new Error('Book not found');
  }
  return book;
}

export async function updateBook(id: string | number, data: Partial<BookFormData>): Promise<Book> {
  const response = await axiosInstance.patch(`/library/books/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteBook(id: string | number): Promise<void> {
  await axiosInstance.delete(`/library/books/${id}`);
}

export async function searchBooks(query: string): Promise<Book[]> {
  const response = await axiosInstance.get('/library/books/search', { params: { q: query } });
  return response.data.data?.data || response.data.data || [];
}

export async function uploadBookCover(id: string | number, file: File): Promise<Book> {
  const formData = new FormData();
  formData.append('cover', file);
  const response = await axiosInstance.post(`/library/books/${id}/cover`, formData);
  return response.data.data || response.data;
}

// Book Copy Management Endpoints
export async function getBookCopies(bookId: string | number): Promise<BookCopy[]> {
  const response = await axiosInstance.get(`/library/books/${bookId}/copies`);
  return response.data.data || response.data || [];
}

export async function createBookCopy(bookId: string | number, data: BookCopyFormData): Promise<BookCopy> {
  const response = await axiosInstance.post(`/library/books/${bookId}/copies`, data);
  return response.data.data || response.data;
}

export async function scanCopyByBarcode(barcode: string): Promise<BookCopy> {
  const response = await axiosInstance.get(`/library/copies/scan/${barcode}`);
  return response.data.data || response.data;
}

export async function updateBookCopy(id: string | number, data: BookCopyUpdateData): Promise<BookCopy> {
  console.log('Updating copy:', id, 'with data:', data);
  try {
    const response = await axiosInstance.patch(`/library/copies/${id}`, data);
    console.log('Update response:', response.data);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Update error details:', error.response?.data);
    throw error;
  }
}
