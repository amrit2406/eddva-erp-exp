// Everyday words for permission actions, and a tint for each so the chips
// are easy to scan. Unknown actions fall back to a capitalised name.
export const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  read: { label: 'View', color: '#008BE9' },
  create: { label: 'Add', color: '#15936a' },
  update: { label: 'Edit', color: '#7c3aed' },
  delete: { label: 'Delete', color: '#d03b3b' },
  submit: { label: 'Send for approval', color: '#c98500' },
  approve: { label: 'Approve', color: '#15936a' },
  reject: { label: 'Reject', color: '#d55181' },
  cancel: { label: 'Cancel', color: '#64748b' },
  post: { label: 'Post', color: '#0891b2' },
  confirm: { label: 'Confirm', color: '#4a3aa7' },
};

// Order chips the way people think about them: see, add, change, remove, then workflow.
export const ACTION_ORDER = ['read', 'create', 'update', 'delete', 'submit', 'approve', 'reject', 'confirm', 'post', 'cancel'];

export function actionInfo(action: string): { label: string; color: string } {
  return ACTION_LABEL[action] ?? { label: action.charAt(0).toUpperCase() + action.slice(1), color: '#64748b' };
}

export const actionRank = (action: string) => {
  const index = ACTION_ORDER.indexOf(action);
  return index === -1 ? ACTION_ORDER.length : index;
};

// "Can approve purchase orders" — what one permission lets a person do.
export function permissionSentence(action: string, area: string): string {
  const thing = area.toLowerCase();
  switch (action) {
    case 'read':
      return `Can see ${thing}`;
    case 'create':
      return `Can add ${thing}`;
    case 'update':
      return `Can edit ${thing}`;
    case 'submit':
      return `Can send ${thing} for approval`;
    default:
      return `Can ${actionInfo(action).label.toLowerCase()} ${thing}`;
  }
}
