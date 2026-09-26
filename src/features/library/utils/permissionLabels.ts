// Everyday words for permission actions, and a tint for each so the chips
// are easy to scan. Unknown actions fall back to a capitalised name.
export const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  read: { label: 'View', color: '#008BE9' },
  create: { label: 'Add', color: '#15936a' },
  update: { label: 'Edit', color: '#7c3aed' },
  delete: { label: 'Delete', color: '#d03b3b' },
  issue: { label: 'Issue', color: '#0891b2' },
  return: { label: 'Take back', color: '#15936a' },
  renew: { label: 'Renew', color: '#c98500' },
  reserve: { label: 'Reserve', color: '#4a3aa7' },
  cancel: { label: 'Cancel', color: '#64748b' },
  collect: { label: 'Collect', color: '#15936a' },
  waive: { label: 'Waive', color: '#d55181' },
  export: { label: 'Export', color: '#0891b2' },
};

// Order chips the way people think about them: see, add, change, remove, then workflow.
export const ACTION_ORDER = ['read', 'create', 'update', 'delete', 'issue', 'return', 'renew', 'reserve', 'cancel', 'collect', 'waive', 'export'];

export function actionInfo(action: string): { label: string; color: string } {
  return ACTION_LABEL[action] ?? { label: humanAction(action), color: '#64748b' };
}

function humanAction(action: string): string {
  const words = action.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export const actionRank = (action: string) => {
  const index = ACTION_ORDER.indexOf(action);
  return index === -1 ? ACTION_ORDER.length : index;
};

// "Can renew issue & return" — what one permission lets a person do.
export function permissionSentence(action: string, area: string): string {
  const thing = area.toLowerCase();
  switch (action) {
    case 'read':
      return `Can see ${thing}`;
    case 'create':
      return `Can add ${thing}`;
    case 'update':
      return `Can edit ${thing}`;
    case 'issue':
      return 'Can lend books to members';
    case 'return':
      return 'Can take books back';
    case 'renew':
      return 'Can extend due dates';
    case 'collect':
      return 'Can collect fine payments';
    case 'waive':
      return 'Can waive fines';
    default:
      return `Can ${actionInfo(action).label.toLowerCase()} ${thing}`;
  }
}
