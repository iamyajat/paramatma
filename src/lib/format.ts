export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}
