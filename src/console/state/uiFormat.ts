export function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function formatTs(ts: number | null | undefined): string {
  if (!ts || ts <= 0) {
    return "n/a";
  }
  return new Date(ts).toISOString();
}

