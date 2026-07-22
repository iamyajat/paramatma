import Link from "next/link";
import { getSiteTotals, getTopWorksByViews, getSiteDailyStats } from "@/lib/admin-data";
import { formatCompactNumber } from "@/lib/format";
import { TrendChart } from "./daily-stats-chart";

export default async function AdminAnalyticsPage() {
  const [totals, topWorks, daily] = await Promise.all([
    getSiteTotals(),
    getTopWorksByViews(15),
    getSiteDailyStats(30),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Total views</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {formatCompactNumber(totals.views)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Total shares</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {formatCompactNumber(totals.shares)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <TrendChart
          title="Site views, last 30 days"
          points={daily.map((d) => ({ date: d.date, value: d.viewCount }))}
          color="var(--color-gold)"
        />
        <TrendChart
          title="Site shares, last 30 days"
          points={daily.map((d) => ({ date: d.date, value: d.shareCount }))}
          color="var(--color-maroon)"
        />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">Top works by views</h2>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
        {topWorks.map((work, i) => (
          <Link
            key={work.id}
            href={`/admin/analytics/${work.id}`}
            className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gold-soft"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {i + 1}. {work.title.en}
              </p>
              <p className="text-xs text-ink-muted">
                {work.type} · {work.deityName.en}
              </p>
            </div>
            <div className="shrink-0 text-right text-sm text-ink-muted">
              <span className="font-medium text-ink">{formatCompactNumber(work.viewCount)}</span> views
              {" · "}
              <span className="font-medium text-ink">{formatCompactNumber(work.shareCount)}</span> shares
            </div>
          </Link>
        ))}
        {topWorks.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-muted">No views recorded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
