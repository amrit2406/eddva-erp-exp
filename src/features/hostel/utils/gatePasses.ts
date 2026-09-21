const FINISHED = ['rejected', 'cancelled', 'canceled', 'returned', 'completed', 'closed', 'expired'];

// Which actions fit a pass's status. An unknown status offers everything and
// lets the backend decide.
export function gatePassActions(status: string | null) {
  if (status === null) return { approve: true, reject: true, cancel: true, scanOut: true, scanIn: true };
  const pending = status === 'pending';
  const approved = status === 'approved';
  return {
    approve: pending,
    reject: pending,
    cancel: pending || approved,
    scanOut: approved,
    // Anything still open that isn't waiting to leave is a pass that's out.
    scanIn: !FINISHED.includes(status) && !pending && !approved,
  };
}
