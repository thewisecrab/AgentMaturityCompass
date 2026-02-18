import type { Command } from "commander";

export function flattenCommandPaths(program: Command): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const walk = (cmd: Command, prefix: string[]): void => {
    for (const child of cmd.commands) {
      const next = [...prefix, child.name()];
      const full = next.join(" ");
      if (!seen.has(full)) {
        seen.add(full);
        out.push(full);
      }
      walk(child, next);
    }
  };

  walk(program, []);
  return out;
}

function editDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) {
    dp[0]![j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }

  return dp[a.length]![b.length]!;
}

export function suggestCommandPaths(input: string, commandPaths: string[], limit = 6): string[] {
  const query = input.trim().toLowerCase();
  if (!query) {
    return [];
  }

  const ranked = commandPaths
    .map((path) => {
      const normalized = path.toLowerCase();
      const tokens = normalized.split(/\s+/).filter(Boolean);
      const tokenDistance = tokens.length > 0
        ? Math.min(...tokens.map((token) => editDistance(query, token)))
        : editDistance(query, normalized);
      const fullDistance = editDistance(query, normalized);
      const prefixMatch = tokens.some((token) => token.startsWith(query));
      const score = prefixMatch ? 0 : Math.min(tokenDistance, fullDistance);
      return { path, score, prefixMatch };
    })
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      if (a.prefixMatch !== b.prefixMatch) {
        return a.prefixMatch ? -1 : 1;
      }
      if (a.path.length !== b.path.length) {
        return a.path.length - b.path.length;
      }
      return a.path.localeCompare(b.path);
    });

  const threshold = Math.max(2, Math.floor(query.length * 0.65));
  return ranked
    .filter((entry) => entry.prefixMatch || entry.score <= threshold)
    .slice(0, limit)
    .map((entry) => entry.path);
}

export function parseUnknownCommandToken(message: string): string | null {
  const match = message.match(/unknown command ['\"]([^'\"]+)['\"]/i);
  return match?.[1] ?? null;
}

export function cliDiscoverabilityFooter(): string {
  return [
    "",
    "Discoverability:",
    "  • Use 'amc help <command>' for detailed subcommand docs",
    "  • Use '--help' after any command path (for example: 'amc run --help')",
    "  • Start with common entry points: setup, up, run, verify, adapters run",
  ].join("\n");
}
