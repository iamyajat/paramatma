import Link from "next/link";
import { getAllDeities } from "@/lib/data";
import { DeleteButton } from "../delete-button";
import { deleteDeity } from "@/lib/actions/deities";

export default async function AdminDeitiesPage() {
  const deities = await getAllDeities();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Deities</h1>
        <Link
          href="/admin/deities/new"
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-white"
        >
          + New deity
        </Link>
      </div>

      <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {deities.map((deity) => (
          <div key={deity.id} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="font-medium text-ink">
                {deity.name.en}{" "}
                <span lang="sa-Deva" className="text-ink-muted">
                  ({deity.name.dev})
                </span>
              </p>
              <p className="truncate text-xs text-ink-muted">/{deity.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/deities/${deity.id}/edit`}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-gold hover:text-gold"
              >
                Edit
              </Link>
              <DeleteButton action={deleteDeity.bind(null, deity.id)} label="Delete deity?" />
            </div>
          </div>
        ))}
        {deities.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-muted">
            No deities yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
