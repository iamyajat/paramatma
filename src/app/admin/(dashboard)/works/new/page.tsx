import Link from "next/link";
import { CONTENT_TYPES, CONTENT_TYPE_META } from "@/lib/content-types";

export default function NewWorkTypePickerPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        What kind of content is this?
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONTENT_TYPES.map((type) => {
          const meta = CONTENT_TYPE_META[type];
          return (
            <Link
              key={type}
              href={`/admin/works/new/${type}`}
              className="rounded-2xl border border-border bg-surface p-5 hover:border-gold"
            >
              <span lang="sa-Deva" className="text-xl text-gold">
                {meta.devanagari}
              </span>
              <h2 className="mt-2 font-display text-lg font-semibold text-ink">
                {meta.plural}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{meta.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
