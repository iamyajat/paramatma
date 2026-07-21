export function VerseDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 ${className ?? ""}`}
    >
      <span className="h-px w-10 bg-border" />
      <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 text-gold" fill="currentColor">
        <path d="M8 0L11 5L16 8L11 11L8 16L5 11L0 8L5 5Z" />
      </svg>
      <span className="h-px w-10 bg-border" />
    </div>
  );
}
