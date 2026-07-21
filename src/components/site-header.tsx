import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { OmMark } from "@/components/icons/om-mark";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <OmMark className="text-2xl text-gold transition-transform group-hover:scale-110" />
          <span
            lang="sa-Deva"
            className="font-scripture text-xl font-semibold tracking-tight text-ink"
          >
            परमात्मा
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/deities"
            className="rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-gold-soft hover:text-ink"
          >
            Deities
          </Link>
          <Link
            href="/search"
            className="rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-gold-soft hover:text-ink"
          >
            Search
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-gold-soft hover:text-ink sm:inline-block"
          >
            About
          </Link>
          <div className="ml-1 sm:ml-2">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
