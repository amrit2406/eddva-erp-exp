// RBAC resource the complaint endpoints are checked against.
export const COMPLAINTS_RESOURCE = 'complaints';

export const COMPLAINT_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

// Resolved and closed have their own actions, so they aren't offered here.
export const MANUAL_STATUSES = ['open', 'in_progress', 'on_hold'];

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const CATEGORY_SUGGESTIONS = ['electrical', 'plumbing', 'carpentry', 'cleaning', 'furniture', 'internet', 'other'];

const CLOSED = ['closed', 'cancelled', 'canceled'];

// Which actions fit a complaint's status. An unknown status offers everything and
// lets the backend decide.
export function complaintActions(status: string | null) {
  if (status === null) {
    return { assign: true, changeStatus: true, resolve: true, close: true, update: true, edit: true };
  }
  const closed = CLOSED.includes(status);
  const resolved = status === 'resolved';
  return {
    assign: !closed && !resolved,
    changeStatus: !closed && !resolved,
    resolve: !closed && !resolved,
    // A resolved complaint is the one that normally gets closed.
    close: !closed,
    update: !closed,
    edit: !closed && !resolved,
  };
}
