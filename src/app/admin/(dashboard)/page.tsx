import Link from "next/link";
import { getAllDeities } from "@/lib/data";
import { getAllWorksAdmin } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const [deities, works] = await Promise.all([getAllDeities(), getAllWorksAdmin()]);
  const published = works.filter((w) => w.status === "published").length;
  const drafts = works.length - published;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Deities</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {deities.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Published works</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {published}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-ink-muted">Drafts</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            {drafts}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/works/new"
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-white"
        >
          + New work
        </Link>
        <Link
          href="/admin/deities/new"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink hover:border-gold hover:text-gold"
        >
          + New deity
        </Link>
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        Recently updated
      </h2>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
        {works.slice(0, 8).map((work) => (
          <Link
            key={work.id}
            href={`/admin/works/${work.id}/edit`}
            className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gold-soft"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{work.title.en}</p>
              <p className="text-xs text-ink-muted">
                {work.type} · {work.deityName.en}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                work.status === "published"
                  ? "bg-gold-soft text-gold"
                  : "border border-border text-ink-muted"
              }`}
            >
              {work.status}
            </span>
          </Link>
        ))}
        {works.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-muted">
            No works yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
