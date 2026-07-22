const SIZE_STYLES = {
  lg: {
    field: "py-3.5 pl-12 pr-4 text-base",
    icon: "left-4 h-5 w-5",
    button: "px-6 py-3.5 text-base",
  },
  md: {
    field: "py-2.5 pl-10 pr-4 text-sm",
    icon: "left-4 h-4 w-4",
    button: "px-5 py-2.5 text-sm",
  },
} as const;

type Props = {
  autoFocus?: boolean;
  defaultValue?: string;
  size?: keyof typeof SIZE_STYLES;
};

/**
 * A native GET form that navigates to /search?q=… on submit — works without
 * client JS, so pressing Enter behaves like a search engine everywhere.
 */
export function SearchBar({ autoFocus, defaultValue, size = "md" }: Props) {
  const s = SIZE_STYLES[size];

  return (
    <form method="get" action="/search" className="mx-auto w-full max-w-lg">
      <label htmlFor="q" className="sr-only">
        Search scriptures
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted ${s.icon}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder="Search names, aartis, deities…"
            autoFocus={autoFocus}
            className={`w-full rounded-full border border-border bg-surface text-ink shadow-soft outline-none focus:border-gold ${s.field}`}
          />
        </div>
        <button
          type="submit"
          className={`shrink-0 rounded-full bg-maroon font-medium text-white shadow-soft transition-transform hover:scale-[1.02] ${s.button}`}
        >
          Search
        </button>
      </div>
    </form>
  );
}
