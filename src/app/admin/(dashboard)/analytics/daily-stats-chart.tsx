type Point = { date: string; value: number };

function scaleY(v: number, max: number, height: number): number {
  return max === 0 ? height : height - (v / max) * height;
}

export function TrendChart({
  title,
  points,
  color,
}: {
  title: string;
  points: Point[];
  color: string;
}) {
  const width = 600;
  const height = 120;
  const max = Math.max(1, ...points.map((p) => p.value));
  const stepX = width / Math.max(points.length - 1, 1);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${scaleY(p.value, max, height)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-ink-muted">{title}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`${title}, ${points[0]?.date} through ${points[points.length - 1]?.date}`}
      >
        <line
          x1="0"
          y1={height - 0.5}
          x2={width}
          y2={height - 0.5}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={i * stepX}
            cy={scaleY(p.value, max, height)}
            r="4"
            fill={color}
            stroke="var(--color-surface)"
            strokeWidth="2"
          >
            <title>{`${p.date}: ${p.value}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
