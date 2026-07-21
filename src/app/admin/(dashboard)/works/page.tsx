import Link from "next/link";
import { getAllWorksAdmin } from "@/lib/admin-data";
import { DeleteButton } from "../delete-button";
import { deleteWork } from "@/lib/actions/works";

export default async function AdminWorksPage() {
  const works = await getAllWorksAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Works</h1>
        <Link
          href="/admin/works/new"
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-white"
        >
          + New work
        </Link>
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {works.map((work) => (
          <div key={work.id} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{work.title.en}</p>
              <p className="truncate text-xs text-ink-muted">
                {work.type} · {work.deityName.en} · /{work.type}/{work.slug}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  work.status === "published"
                    ? "bg-gold-soft text-gold"
                    : "border border-border text-ink-muted"
                }`}
              >
                {work.status}
              </span>
              <Link
                href={`/admin/works/${work.id}/edit`}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:text-gold"
              >
                Edit
              </Link>
              <DeleteButton action={deleteWork.bind(null, work.id)} label="Delete this work?" />
            </div>
          </div>
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
