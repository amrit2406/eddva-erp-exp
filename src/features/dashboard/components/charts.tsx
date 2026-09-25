import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../../../components/ui/Card';

// Categorical slots in fixed order (dataviz reference palette, light mode).
// A single-series chart always uses slot 1.
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a'] as const;

const GRID = '#e2e8f0';
const AXIS_TEXT = { fill: '#64748b', fontSize: 12 };
const CURSOR = { fill: '#f1f5f9' };
const TOOLTIP_STYLE = { borderRadius: 8, borderColor: '#e2e8f0', fontSize: 13 };

type ValueFormatter = (value: number) => string;
const plain: ValueFormatter = (value) => value.toLocaleString('en-IN');

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function EmptyChart({ message = 'No data yet' }: { message?: string }) {
  return <div className="h-40 flex items-center justify-center text-sm text-slate-400">{message}</div>;
}

interface Row {
  label: string;
  value: number;
  // Shown in the tooltip instead of the axis label, e.g. a full name.
  detail?: string;
}

// One series, categories down the side — rankings and status breakdowns.
export function HorizontalBars({
  rows,
  name,
  format = plain,
  color = SERIES[0],
  labelWidth = 120,
}: {
  rows: Row[];
  name: string;
  format?: ValueFormatter;
  color?: string;
  labelWidth?: number;
}) {
  if (rows.length === 0 || rows.every((row) => row.value === 0)) return <EmptyChart />;
  const height = Math.max(140, rows.length * 36 + 24);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" tick={AXIS_TEXT} tickFormatter={format} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={AXIS_TEXT} width={labelWidth} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={CURSOR}
          contentStyle={TOOLTIP_STYLE}
          formatter={(value) => [format(Number(value)), name]}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.detail ?? label}
        />
        <Bar dataKey="value" name={name} fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// One series, categories along the bottom — values over time or ordered stages.
export function ColumnBars({ rows, name, format = plain }: { rows: Row[]; name: string; format?: ValueFormatter }) {
  if (rows.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={AXIS_TEXT} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS_TEXT} tickFormatter={format} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={CURSOR} contentStyle={TOOLTIP_STYLE} formatter={(value) => [format(Number(value)), name]} />
        <Bar dataKey="value" name={name} fill={SERIES[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Several series side by side per category (max 3, in slot order), with a legend.
export function GroupedColumns({
  rows,
  series,
  format = plain,
  height = 240,
}: {
  rows: ({ label: string } & Record<string, string | number>)[];
  series: { key: string; name: string }[];
  format?: ValueFormatter;
  height?: number;
}) {
  if (rows.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={AXIS_TEXT} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS_TEXT} tickFormatter={format} axisLine={false} tickLine={false} allowDecimals={false} width={64} />
        <Tooltip cursor={CURSOR} contentStyle={TOOLTIP_STYLE} formatter={(value, seriesName) => [format(Number(value)), seriesName]} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#475569' }} />
        {series.map((s, index) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={SERIES[index]} radius={[4, 4, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// A single ratio against its limit — reads better than a two-slice pie.
export function Meter({ label, value, max, caption }: { label: string; value: number; max: number; caption?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900 tabular-nums">{Math.round(pct * 10) / 10}%</span>
      </div>
      <div
        className="mt-1.5 h-2 rounded-full bg-[#cde2fb] overflow-hidden"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SERIES[0] }} />
      </div>
      {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
