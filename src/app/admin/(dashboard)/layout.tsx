import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export const metadata = { robots: { index: false, follow: false } };
// Admin data must always be live — never statically cached — and this
// section is auth-gated per-request via proxy.ts anyway, so there's no
// caching upside to lose.
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/deities"
            className="rounded-full px-3 py-1.5 text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
          >
            Deities
          </Link>
          <Link
            href="/admin/works"
            className="rounded-full px-3 py-1.5 text-sm text-ink-muted hover:bg-gold-soft hover:text-ink"
          >
            Works
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-ink-muted hover:text-gold">
            View site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted hover:border-gold hover:text-gold"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
