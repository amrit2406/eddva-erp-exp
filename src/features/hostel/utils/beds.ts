import type { HostelBed } from '../types/hostel.types';

// The backend may report occupancy as a status string or an is_occupied flag.
export function bedStatus(bed: HostelBed): string | null {
  if (bed.status) return bed.status.toLowerCase();
  if (bed.is_occupied !== undefined) return bed.is_occupied ? 'occupied' : 'available';
  return null;
}

export function bedRoomLabel(bed: HostelBed): string {
  return bed.room?.room_number || bed.room_number || `#${bed.room_id}`;
}

export function bedBlockLabel(bed: HostelBed, blockName: (blockId: number) => string | undefined): string {
  const blockId = bed.room?.block_id ?? bed.block_id;
  return (
    bed.block_name || bed.room?.block?.name || (blockId !== undefined ? blockName(blockId) : undefined) || '—'
  );
}
