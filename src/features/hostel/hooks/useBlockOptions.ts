import { useEffect, useMemo, useState } from 'react';
import { getBlocks } from '../api/hostel.api';
import type { HostelBlock } from '../types/hostel.types';

// Loads the blocks once so pages can offer a block picker and resolve block
// names for rooms that only carry a block_id.
export function useBlockOptions() {
  const [blocks, setBlocks] = useState<HostelBlock[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBlocks()
      .then((data) => {
        if (!cancelled) setBlocks(data);
      })
      .catch(() => {
        if (!cancelled) setBlocks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const blockName = useMemo(() => {
    const names = new Map((blocks ?? []).map((block) => [block.block_id, block.name]));
    return (blockId: number) => names.get(blockId);
  }, [blocks]);

  return { blocks: blocks ?? [], loaded: blocks !== null, blockName };
}
