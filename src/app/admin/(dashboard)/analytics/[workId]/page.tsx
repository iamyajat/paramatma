import { notFound } from "next/navigation";
import { getWorkByIdAdmin, getWorkDailyStats } from "@/lib/admin-data";
import { formatCompactNumber } from "@/lib/format";
import { TrendChart } from "../daily-stats-chart";

export default async function WorkAnalyticsPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const [work, daily] = await Promise.all([
    getWorkByIdAdmin(workId),
    getWorkDailyStats(workId, 30),
  ]);
  if (!work) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">{work.title.en}</h1>
      <p className="text-sm text-ink-muted">
        {work.type} · {work.deityName.en}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Total views</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {formatCompactNumber(work.viewCount)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Total shares</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {formatCompactNumber(work.shareCount)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <TrendChart
          title="Views, last 30 days"
          points={daily.map((d) => ({ date: d.date, value: d.viewCount }))}
          color="var(--color-gold)"
        />
        <TrendChart
          title="Shares, last 30 days"
          points={daily.map((d) => ({ date: d.date, value: d.shareCount }))}
          color="var(--color-maroon)"
        />
      </div>
    </div>
  );
}
