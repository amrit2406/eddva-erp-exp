import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

export interface RowMenuItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
}

const MENU_WIDTH = 176;
const GAP = 6;

// "More" menu for secondary row actions, so risky ones (delete) aren't one tap away.
// The menu is portalled to <body> with fixed positioning, so no card, table or
// overflow container can clip it; it opens upward when there's no room below.
export default function RowMenu({ items, label = 'More actions' }: { items: RowMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Measure after the menu renders so its real height decides up vs down.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;
    const place = () => {
      const button = buttonRef.current!.getBoundingClientRect();
      const menuHeight = menuRef.current!.offsetHeight;
      const fitsBelow = button.bottom + GAP + menuHeight <= window.innerHeight - 8;
      const top = fitsBelow ? button.bottom + GAP : Math.max(8, button.top - GAP - menuHeight);
      const left = Math.min(Math.max(8, button.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
      setPosition({ top, left });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false);
        return;
      }
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (items.length === 0) return null;

  const toggle = () => {
    setPosition(null);
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 ring-1 transition hover:bg-slate-100 hover:text-slate-800 hover:ring-slate-200 ${
          open ? 'bg-slate-100 text-slate-800 ring-slate-200' : 'ring-transparent'
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[90] overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-slate-200"
            // Hidden for the one frame before it has been measured and placed.
            style={{ width: MENU_WIDTH, top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}
          >
            {items.map(({ label: itemLabel, icon: Icon, to, onClick, danger }) => {
              const className = `flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
              }`;
              return to ? (
                <Link key={itemLabel} to={to} role="menuitem" className={className} onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4" /> {itemLabel}
                </Link>
              ) : (
                <button
                  key={itemLabel}
                  type="button"
                  role="menuitem"
                  className={className}
                  onClick={() => {
                    setOpen(false);
                    onClick?.();
                  }}
                >
                  <Icon className="h-4 w-4" /> {itemLabel}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
