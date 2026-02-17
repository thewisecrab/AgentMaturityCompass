export function assertNoSelfScoring(payload: Record<string, unknown>): void {
  const forbidden = ["score", "scores", "maturity", "questionScores", "42answers", "diagnosticScore"];
  for (const key of Object.keys(payload)) {
    if (forbidden.some((token) => key.toLowerCase().includes(token.toLowerCase()))) {
      throw new Error(`AMC SDK blocks self-reported scoring key: ${key}`);
    }
  }
}

export function requireBridgeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new Error("bridgeUrl must be absolute http(s) URL");
  }
  return trimmed.replace(/\/+$/, "");
}
