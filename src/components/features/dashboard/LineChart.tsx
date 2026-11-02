import { memo, useId, useMemo, useState, type PointerEvent } from 'react';
import { formatCompact, formatShortDate } from '@/utils/format';

export interface ChartPoint {
  /** ISO date */
  x: string;
  y: number;
}

export interface LineChartProps {
  data: ChartPoint[];
  /** Short name of the series, e.g. "Revenue". */
  seriesLabel: string;
  formatValue: (value: number) => string;
  height?: number;
}

const WIDTH = 640;
// Axis labels are in viewBox units, so the class sizes them larger on phones where the
// chart is drawn at ~half scale (22 units ≈ 11px) and normal size from the sm breakpoint.
const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

/** Round, even ticks (steps of 1, 2, 2.5 or 5 x 10^n) with the top tick above the maximum: 4-6 ticks. */
function niceScale(value: number): { max: number; step: number } {
  if (value <= 0) return { max: 1, step: 0.25 };
  const rough = value / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)!;
  const max = Math.ceil(value / step) * step;
  return { max: max === value ? max + step : max, step };
}

/**
 * Dependency-free, responsive SVG line chart. Exposes a text summary to assistive
 * tech (role="img" + title/desc) and an equivalent data table for full detail.
 */
export const LineChart = memo(function LineChart({ data, seriesLabel, formatValue, height = 240 }: LineChartProps) {
  const titleId = useId();
  const descId = useId();
  const [active, setActive] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const values = data.map((d) => d.y);
    const { max, step: tickStep } = niceScale(Math.max(...values, 0));
    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    const points = data.map((d, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - (d.y / max) * innerH,
    }));
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = points.length
      ? `${line} L${points.at(-1)!.x.toFixed(1)},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`
      : '';
    const ticks = Array.from({ length: Math.round(max / tickStep) + 1 }, (_, i) => i * tickStep).map((v) => ({
      value: v,
      y: PAD.top + innerH - (v / max) * innerH,
    }));
    // ~5 evenly spaced date labels. The latest date is always labelled; the regular label
    // just before it is dropped when it is less than a full interval away (they would overlap).
    const labelEvery = Math.max(1, Math.ceil(data.length / 5));
    const lastIndex = data.length - 1;
    const tooClose = lastIndex - (lastIndex % labelEvery);
    const labelIndexes = new Set(
      data
        .map((_, i) => i)
        .filter((i) => i === lastIndex || (i % labelEvery === 0 && (i !== tooClose || i === lastIndex))),
    );
    return { points, line, area, ticks, labelIndexes, step };
  }, [data, height]);

  const summary = useMemo(() => {
    if (data.length === 0) return 'No data.';
    const values = data.map((d) => d.y);
    const first = data[0]!;
    const last = data.at(-1)!;
    const maxIdx = values.indexOf(Math.max(...values));
    const minIdx = values.indexOf(Math.min(...values));
    const change = first.y ? ((last.y - first.y) / first.y) * 100 : 0;
    return `${seriesLabel} from ${formatShortDate(first.x)} to ${formatShortDate(last.x)}: ${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}%. Highest ${formatValue(data[maxIdx]!.y)} on ${formatShortDate(data[maxIdx]!.x)}, lowest ${formatValue(data[minIdx]!.y)} on ${formatShortDate(data[minIdx]!.x)}, latest ${formatValue(last.y)}.`;
  }, [data, seriesLabel, formatValue]);

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!geometry.step) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const index = Math.round((x - PAD.left) / geometry.step);
    setActive(Math.min(data.length - 1, Math.max(0, index)));
  };

  const activePoint = active !== null ? geometry.points[active] : undefined;
  const activeDatum = active !== null ? data[active] : undefined;

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="h-auto w-full touch-none overflow-visible"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        <title id={titleId}>{`${seriesLabel} trend`}</title>
        <desc id={descId}>{summary}</desc>
        {geometry.ticks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={tick.y}
              y2={tick.y}
              // Faint solid gridlines; the baseline is the one heavier line. No y-axis line.
              className={tick.value === 0 ? 'stroke-control' : 'stroke-grid'}
            />
            <text x={PAD.left - 8} y={tick.y} dy="0.32em" textAnchor="end" className="num fill-muted text-[22px] sm:text-[12px]">
              {formatCompact(tick.value)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          geometry.labelIndexes.has(i) ? (
            <text
              key={d.x}
              x={geometry.points[i]!.x}
              y={height - 8}
              textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
              className="num fill-muted text-[22px] sm:text-[12px]"
            >
              {formatShortDate(d.x)}
            </text>
          ) : null,
        )}
        {/* A flat tint (no gradient) under one 2px line in the product's teal: the screen's main data hue. */}
        <path d={geometry.area} className="fill-accent-soft" />
        <path d={geometry.line} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-accent" />
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={PAD.top}
              y2={height - PAD.bottom}
              className="stroke-control"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r={5} strokeWidth={2} className="fill-surface stroke-accent" />
          </g>
        )}
      </svg>
      {activePoint && activeDatum && (
        <div
          aria-hidden="true"
          className="num pointer-events-none absolute top-0 rounded-control bg-primary px-2.5 py-1.5 text-xs whitespace-nowrap text-on-primary"
          style={{
            left: `${(activePoint.x / WIDTH) * 100}%`,
            transform: `translateX(${activePoint.x > WIDTH / 2 ? 'calc(-100% - 12px)' : '12px'})`,
          }}
        >
          {formatShortDate(activeDatum.x)} · {seriesLabel} {formatValue(activeDatum.y)}
        </div>
      )}
    </figure>
  );
});
