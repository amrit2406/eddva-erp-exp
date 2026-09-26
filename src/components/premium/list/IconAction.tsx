import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IconActionProps {
  icon: LucideIcon;
  // Shown as a tooltip on hover/focus and read out by screen readers.
  label: string;
  to?: string;
  onClick?: () => void;
  tone?: 'default' | 'brand' | 'danger';
  // Greyed out; `label` should then say why (e.g. "Only drafts can be edited").
  disabled?: boolean;
}

const TONES = {
  default: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  brand: 'text-brand hover:bg-brand/10 hover:text-brand-navy',
  danger: 'text-slate-500 hover:bg-red-50 hover:text-red-600',
};

const GAP = 6;

// Tooltip rendered into <body> with fixed positioning, so rounded cards,
// tables and expandable panels can never clip it. Sits above the icon, or
// below when there's no room above.
function Tooltip({ anchor, label }: { anchor: HTMLElement; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const a = anchor.getBoundingClientRect();
    const t = ref.current.getBoundingClientRect();
    const above = a.top - GAP - t.height;
    const top = above >= 8 ? above : a.bottom + GAP;
    const left = Math.min(Math.max(8, a.left + a.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
    setPos({ top, left });
  }, [anchor, label]);

  return createPortal(
    <span
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-[95] whitespace-nowrap rounded-lg bg-[#0b1f3f] px-2.5 py-1 text-xs font-medium text-white shadow-lg transition-opacity duration-100"
      style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, opacity: pos ? 1 : 0 }}
    >
      {label}
    </span>,
    document.body,
  );
}

// Icon-only row action with an instant tooltip — keeps rows calm while the
// label is one hover away.
export default function IconAction({ icon: Icon, label, to, onClick, tone = 'default', disabled = false }: IconActionProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const className = `flex h-9 w-9 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
    disabled ? 'cursor-not-allowed text-slate-300' : TONES[tone]
  }`;
  const hover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget),
    onMouseLeave: () => setAnchor(null),
    onFocus: (e: React.FocusEvent<HTMLElement>) => setAnchor(e.currentTarget),
    onBlur: () => setAnchor(null),
  };

  const control = disabled ? (
    <span role="button" tabIndex={0} aria-disabled="true" aria-label={label} className={className} {...hover}>
      <Icon className="h-4 w-4" />
    </span>
  ) : to ? (
    <Link to={to} aria-label={label} className={className} {...hover} onClick={() => setAnchor(null)}>
      <Icon className="h-4 w-4" />
    </Link>
  ) : (
    <button
      type="button"
      aria-label={label}
      className={className}
      {...hover}
      onClick={() => {
        setAnchor(null);
        onClick?.();
      }}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <>
      {control}
      {anchor && <Tooltip anchor={anchor} label={label} />}
    </>
  );
}
