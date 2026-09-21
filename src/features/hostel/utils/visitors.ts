import { recordStatus } from './records';
import type { GenericRecord } from '../types/hostel.types';

// RBAC resource the visitor endpoints are checked against.
export const VISITORS_RESOURCE = 'visitors';

const LEFT_STATUSES = ['checked_out', 'checkedout', 'checked-out', 'out', 'left', 'completed', 'closed'];
const OUT_TIME_KEYS = ['out_time', 'check_out_time', 'checkout_time', 'checked_out_at', 'out_at'];

// A visitor has left when their status says so or an out time has been recorded.
// An unrecognised record counts as still inside, so checkout stays available and
// the backend decides.
export function isCheckedOut(visitor: GenericRecord): boolean {
  const status = recordStatus(visitor);
  if (status && LEFT_STATUSES.includes(status)) return true;
  return OUT_TIME_KEYS.some((key) => visitor[key] !== null && visitor[key] !== undefined && visitor[key] !== '');
}
