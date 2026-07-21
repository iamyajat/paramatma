export function OmMark({ className }: { className?: string }) {
  return (
    <span
      lang="sa-Deva"
      aria-hidden="true"
      className={className}
      style={{ fontFamily: "var(--font-scripture)" }}
    >
      ॐ
    </span>
  );
}
