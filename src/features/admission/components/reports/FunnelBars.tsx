import { formatCell, type FunnelStage } from '../../utils/reports';

// Single series, so one hue and no legend — the report title says what is plotted.
// Bars are thin (20px), grow from one baseline, square there and 4px-rounded at the
// data end, with the value at the tip. The longest bar stops at 85% of the track so
// its label always fits outside it.
const BAR_COLOR = '#008BE9';

export default function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((stage) => stage.value), 1);
  const first = stages[0]?.value ?? 0;

  return (
    <div>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const share = first > 0 ? Math.round((stage.value / first) * 100) : null;
          const width = (stage.value / max) * 85;
          const tooltip = `${stage.label}: ${formatCell(stage.value)}${
            index > 0 && share !== null ? ` (${share}% of ${stages[0].label.toLowerCase()})` : ''
          }`;
          return (
            <div key={`${stage.label}-${index}`} className="flex items-center gap-4" title={tooltip}>
              <div className="w-36 sm:w-48 flex-shrink-0 text-sm text-slate-700 text-right truncate">{stage.label}</div>
              <div className="flex-1 flex items-center border-l border-slate-200 py-0.5">
                <div
                  className="h-5 rounded-r"
                  style={{ width: stage.value > 0 ? `max(${width}%, 4px)` : 0, backgroundColor: BAR_COLOR }}
                />
                <span className="ml-2 text-sm font-medium text-slate-900 whitespace-nowrap">
                  {formatCell(stage.value)}
                  {index > 0 && share !== null && (
                    <span className="ml-2 text-xs font-normal text-slate-500">{share}%</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {stages.length > 1 && first > 0 && (
        <p className="mt-4 text-xs text-slate-500">Percentages are relative to {stages[0].label.toLowerCase()}.</p>
      )}
    </div>
  );
}
