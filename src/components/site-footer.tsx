import Link from "next/link";
import { OmMark } from "@/components/icons/om-mark";
import { CONTENT_TYPES, CONTENT_TYPE_META } from "@/lib/content-types";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <OmMark className="text-xl text-gold" />
            <span lang="sa-Deva" className="font-scripture text-lg font-semibold text-ink">
              परमात्मा
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            A quiet home for Hindu scriptures — names, hymns, and prayers, offered
            for reading and remembrance.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-ink">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/deities" className="hover:text-gold">
                Browse by deity
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-gold">
                Search
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gold">
                About &amp; sources
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-ink">Content</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            {CONTENT_TYPES.map((type) => (
              <li key={type}>
                <Link href={`/${type}`} className="hover:text-gold">
                  {CONTENT_TYPE_META[type].plural}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-5xl text-xs text-ink-muted">
          © {new Date().getFullYear()}{" "}
          <span lang="sa-Deva" className="font-scripture">
            परमात्मा
          </span>
          . Scriptures belong to the shared tradition; translations and
          sourced material are attributed on each page.
        </p>
      </div>
    </footer>
  );
}
