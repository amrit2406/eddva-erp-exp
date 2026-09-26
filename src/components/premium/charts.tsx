import { useId, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts';

// Categorical palette in fixed order, led by the brand blue — all eight pass
// the dataviz CVD checks. Aqua/yellow/magenta sit under 3:1 on white, so every
// multi-color chart here carries direct value labels or a valued legend.
const PALETTE = ['#008BE9', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'] as const;
// Same hues re-stepped for the navy spotlight surface (validated against #0b2a5c).
const DARK_PAIR = ['#1f8fe6', '#e66a36'] as const;
// Ordinal ramp for ordered stages, sky -> brand navy (validated --ordinal).
const FUNNEL_RAMP = ['#7ab8f0', '#519fe8', '#2c86dc', '#136cc4', '#0a55a4', '#084084', '#062d62'] as const;
// Palette colors light enough to need dark text on top of them.
const LIGHT_FILLS = new Set<string>(['#1baf7a', '#eda100', '#e87ba4']);

type Tone = 'light' | 'dark';
const TONE = {
  light: { grid: '#eef2f6', axis: { fill: '#64748b', fontSize: 12 }, cursor: { fill: 'rgb(0 139 233 / 0.06)' }, legend: '#475569' },
  dark: { grid: 'rgb(255 255 255 / 0.08)', axis: { fill: 'rgb(224 242 254 / 0.7)', fontSize: 12 }, cursor: { fill: 'rgb(255 255 255 / 0.06)' }, legend: 'rgb(224 242 254 / 0.85)' },
};

type ValueFormatter = (value: number) => string;
const plain: ValueFormatter = (value) => value.toLocaleString('en-IN');

const colorAt = (index: number) => PALETTE[index % PALETTE.length];

// SVG ids can't contain the colons React's useId produces.
function useGradientId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, '')}`;
}

interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  payload?: { detail?: string; fill?: string };
}

function PremiumTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  format: ValueFormatter;
}) {
  if (!active || !payload?.length) return null;
  const title = payload[0]?.payload?.detail ?? label;

  return (
    <div className="rounded-xl bg-[#0b1f3f]/95 px-3.5 py-2.5 shadow-xl ring-1 ring-white/10 backdrop-blur-sm">
      {title !== undefined && <p className="text-xs font-medium text-sky-100/80 mb-1.5">{title}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.name)} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.payload?.fill ?? entry.color }} />
            <span className="text-sky-100/80">{entry.name}</span>
            <span className="ml-auto pl-4 font-semibold text-white tabular-nums">{format(Number(entry.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recharts hands the tooltip loosely-typed props; narrow them once here.
function tooltipContent(format: ValueFormatter) {
  return (props: { active?: boolean; payload?: unknown; label?: unknown }) => (
    <PremiumTooltip
      active={props.active}
      payload={props.payload as readonly TooltipEntry[] | undefined}
      label={props.label as string | number | undefined}
      format={format}
    />
  );
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  tone = 'light',
  fill = false,
  className = '',
  style,
}: {
  title: string;
  subtitle?: string;
  // Any icon component that takes a className (Lucide or react-icons).
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  children: ReactNode;
  tone?: Tone;
  // Stretch the body to the card's full height (for cards sized by their grid row).
  fill?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const dark = tone === 'dark';
  return (
    <section
      className={`animate-rise relative overflow-hidden rounded-3xl p-5 sm:p-6 ${fill ? 'flex flex-col' : ''} ${
        dark
          ? 'bg-gradient-to-br from-[#06214d] via-[#0b2a5c] to-[#0d3a78] text-white shadow-lift'
          : 'bg-white shadow-soft ring-1 ring-slate-200/70'
      } ${className}`}
      style={style}
    >
      {dark && (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 h-60 w-60 rounded-full bg-brand/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#e66a36]/20 blur-3xl" />
        </>
      )}
      <div className="relative flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                dark ? 'bg-white/10 ring-1 ring-white/20' : 'bg-gradient-to-br from-brand/15 to-brand-navy/10 ring-1 ring-brand/15'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${dark ? 'text-sky-200' : 'text-brand-navy'}`} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className={`text-[15px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            {subtitle && <p className={`text-xs mt-0.5 truncate ${dark ? 'text-sky-100/70' : 'text-slate-500'}`}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={fill ? 'relative flex flex-1 flex-col min-h-0' : 'relative'}>{children}</div>
    </section>
  );
}

export function EmptyChart({ message = 'No data yet', height = 160 }: { message?: string; height?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-400"
      style={{ height }}
    >
      {message}
    </div>
  );
}

interface Row {
  label: string;
  value: number;
  detail?: string;
  // Makes the row a link (leaderboards).
  to?: string;
}

// Donut with the total in the middle and a valued legend beside it.
export function DonutChart({ rows, totalLabel, format = plain }: { rows: Row[]; totalLabel: string; format?: ValueFormatter }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total === 0) return <EmptyChart />;
  const data = rows.map((row, index) => ({ ...row, fill: colorAt(index) }));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={tooltipContent(format)} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{format(total)}</span>
          <span className="text-[11px] uppercase tracking-wider text-slate-500">{totalLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {data.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: row.fill }} />
            <span className="text-slate-600 truncate">{row.label}</span>
            <span className="ml-auto font-semibold text-slate-900 tabular-nums">{format(row.value)}</span>
            <span className="w-10 text-right text-xs text-slate-400 tabular-nums">{Math.round((row.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeaderboardRow({ to, children }: { to?: string; children: ReactNode }) {
  const className = 'flex items-center gap-3';
  if (!to) return <div className={className}>{children}</div>;
  return (
    <Link to={to} className={`${className} -mx-2 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50`}>
      {children}
    </Link>
  );
}

// Ranked list with a rank badge, colored progress bar and the value.
export function Leaderboard({ rows, format = plain }: { rows: Row[]; format?: ValueFormatter }) {
  if (rows.length === 0) return <EmptyChart />;
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ol className="space-y-3.5">
      {rows.map((row, index) => {
        const color = colorAt(index);
        return (
          <li key={`${row.label}-${index}`} className="group" title={row.detail}>
            <LeaderboardRow to={row.to}>
              <span
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{ background: `${color}1f`, color: LIGHT_FILLS.has(color) ? '#334155' : color }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{row.label}</p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">{format(row.value)}</p>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${(row.value / max) * 100}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
                  />
                </div>
                {row.detail && <p className="mt-1 text-[11px] text-slate-400 truncate">{row.detail}</p>}
              </div>
            </LeaderboardRow>
          </li>
        );
      })}
    </ol>
  );
}

// Centered, narrowing stages — each stage shows its count and conversion from the previous one.
export function Funnel({ rows }: { rows: Row[] }) {
  if (rows.length === 0 || rows.every((row) => row.value === 0)) return <EmptyChart />;
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="space-y-1.5">
      {rows.map((row, index) => {
        const color = FUNNEL_RAMP[Math.min(index, FUNNEL_RAMP.length - 1)];
        const prev = index > 0 ? rows[index - 1].value : 0;
        const conversion = index > 0 && prev > 0 ? Math.round((row.value / prev) * 100) : null;
        const width = Math.max(18, (row.value / max) * 100);
        return (
          <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex justify-center">
              <div
                className="flex h-8 items-center justify-center rounded-lg px-2 transition-[width] duration-700 ease-out"
                style={{ width: `${width}%`, background: color, opacity: row.value === 0 ? 0.35 : 1 }}
              >
                <span className={`text-xs font-semibold tabular-nums ${index < 2 ? 'text-slate-900' : 'text-white'}`}>{row.value}</span>
              </div>
            </div>
            <div className="w-32 sm:w-36">
              <p className="text-xs font-medium text-slate-700 truncate">{row.label}</p>
              {conversion !== null && <p className="text-[11px] text-slate-400">{conversion}% from previous</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Smooth trend with a gradient wash under the line.
export function GradientArea({ rows, name, format = plain }: { rows: Row[]; name: string; format?: ValueFormatter }) {
  const gradientId = useGradientId('area');
  if (rows.length === 0) return <EmptyChart height={220} />;
  const t = TONE.light;

  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={rows} margin={{ top: 16, right: 12, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.35} />
            <stop offset="55%" stopColor="#7c6cf0" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#7c6cf0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="4 6" />
        <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis tick={t.axis} tickFormatter={format} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={{ stroke: PALETTE[0], strokeDasharray: '4 4' }} content={tooltipContent(format)} />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke={PALETTE[0]}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: '#fff', stroke: PALETTE[0], strokeWidth: 2 }}
          activeDot={{ r: 6, fill: PALETTE[0], stroke: '#fff', strokeWidth: 2 }}
        >
          <LabelList dataKey="value" position="top" offset={10} className="fill-slate-600 text-xs font-medium" />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Half-circle gauge for a ratio against its limit.
export function Gauge({ label, value, max, caption, color = PALETTE[0] }: { label: string; value: number; max: number; caption?: string; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const rounded = Math.round(pct * 10) / 10;

  return (
    <div className="flex flex-col items-center rounded-2xl bg-slate-50/80 px-3 pt-3 pb-3 ring-1 ring-slate-100">
      <div className="relative h-24 w-full max-w-[180px]" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={[{ name: label, value: pct, fill: color }]}
            cx="50%"
            cy="100%"
            innerRadius="140%"
            outerRadius="190%"
            startAngle={180}
            endAngle={0}
            barSize={14}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#e2e8f0' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
          <span className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{rounded}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-700">{label}</p>
      {caption && <p className="text-xs text-slate-500 text-center">{caption}</p>}
    </div>
  );
}

interface TreemapNodeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
  depth?: number;
}

function TreemapNode({ x = 0, y = 0, width = 0, height = 0, index = 0, name, value, depth }: TreemapNodeProps) {
  if (depth === 0) return null;
  const fill = colorAt(index);
  const ink = LIGHT_FILLS.has(fill) ? '#0f172a' : '#ffffff';
  const roomy = width > 70 && height > 44;

  return (
    <g>
      <rect x={x + 2} y={y + 2} width={Math.max(0, width - 4)} height={Math.max(0, height - 4)} rx={12} fill={fill} />
      {roomy && (
        <>
          <text x={x + 14} y={y + 26} fill={ink} fontSize={13} fontWeight={600}>
            {name}
          </text>
          <text x={x + 14} y={y + 44} fill={ink} fontSize={12} opacity={0.85}>
            {value?.toLocaleString('en-IN')} units
          </text>
        </>
      )}
    </g>
  );
}

// Area-proportional blocks — which locations hold the most stock.
export function StockTreemap({ rows, height = 240 }: { rows: Row[]; height?: number }) {
  if (rows.length === 0 || rows.every((row) => row.value === 0)) return <EmptyChart height={height} />;
  const data = rows.map((row) => ({ name: row.label, value: row.value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap data={data} dataKey="value" nameKey="name" isAnimationActive={false} content={<TreemapNode />}>
        <Tooltip content={tooltipContent(plain)} />
      </Treemap>
    </ResponsiveContainer>
  );
}

// Several series side by side per category, with a legend. Tone picks the surface.
export function GroupedColumns({
  rows,
  series,
  format = plain,
  height = 240,
  showValues = false,
  tone = 'light',
}: {
  rows: ({ label: string } & Record<string, string | number>)[];
  series: { key: string; name: string }[];
  format?: ValueFormatter;
  height?: number;
  showValues?: boolean;
  tone?: Tone;
}) {
  const baseId = useGradientId('grp');
  if (rows.length === 0) return <EmptyChart height={height} />;
  const t = TONE[tone];
  const colors = tone === 'dark' ? DARK_PAIR : PALETTE;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: showValues ? 20 : 8, right: 8, bottom: 0, left: 0 }} barGap={4}>
        <defs>
          {series.map((s, index) => (
            <linearGradient key={s.key} id={`${baseId}-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[index]} stopOpacity={1} />
              <stop offset="100%" stopColor={colors[index]} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="4 6" />
        <XAxis dataKey="label" tick={t.axis} axisLine={false} tickLine={false} />
        <YAxis tick={t.axis} tickFormatter={format} axisLine={false} tickLine={false} allowDecimals={false} width={64} />
        <Tooltip cursor={t.cursor} content={tooltipContent(format)} />
        <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, color: t.legend, paddingBottom: 12 }} />
        {series.map((s, index) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={`url(#${baseId}-${index})`} radius={[8, 8, 3, 3]} maxBarSize={30}>
            {showValues && (
              <LabelList
                dataKey={s.key}
                position="top"
                formatter={(value) => format(Number(value))}
                className={tone === 'dark' ? 'fill-sky-100 text-[11px]' : 'fill-slate-600 text-[11px]'}
              />
            )}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
