// Everyday words for permission actions, and a tint for each so the chips
// are easy to scan. Unknown actions fall back to a capitalised name.
export const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  read: { label: 'View', color: '#008BE9' },
  create: { label: 'Add', color: '#15936a' },
  update: { label: 'Edit', color: '#7c3aed' },
  delete: { label: 'Delete', color: '#d03b3b' },
  cancel: { label: 'Cancel', color: '#64748b' },
  barcode_lookup: { label: 'Scan ID card', color: '#0891b2' },
  availability: { label: 'Turn on/off', color: '#c98500' },
  topup: { label: 'Top up', color: '#15936a' },
  block: { label: 'Block', color: '#d55181' },
  unblock: { label: 'Unblock', color: '#4a3aa7' },
  refund: { label: 'Refund', color: '#c98500' },
  open: { label: 'Open', color: '#15936a' },
  close: { label: 'Close', color: '#4a3aa7' },
};

// Order chips the way people think about them: see, add, change, remove, then workflow.
export const ACTION_ORDER = ['read', 'create', 'update', 'delete', 'open', 'close', 'availability', 'barcode_lookup', 'topup', 'block', 'unblock', 'refund', 'cancel'];

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

// "Can top up member wallets" — what one permission lets a person do.
export function permissionSentence(action: string, area: string): string {
  const thing = area.toLowerCase();
  switch (action) {
    case 'read':
      return `Can see ${thing}`;
    case 'create':
      return `Can add ${thing}`;
    case 'update':
      return `Can edit ${thing}`;
    case 'barcode_lookup':
      return `Can find ${thing} by scanning an ID card`;
    case 'availability':
      return `Can turn ${thing} on or off`;
    default:
      return `Can ${actionInfo(action).label.toLowerCase()} ${thing}`;
  }
}
