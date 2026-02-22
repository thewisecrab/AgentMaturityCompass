import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { setImmediate as setImmediateCallback } from "node:timers";
import { promisify } from "node:util";
import { afterEach, describe, expect, test } from "vitest";
import { openLedger, verifyLedgerIntegrity } from "../../src/ledger/ledger.js";
import { initWorkspace } from "../../src/workspace.js";

const roots: string[] = [];
const waitImmediate = promisify(setImmediateCallback);

function newWorkspace(prefix: string): string {
  const workspace = mkdtempSync(join(tmpdir(), prefix));
  roots.push(workspace);
  initWorkspace({ workspacePath: workspace, trustBoundaryMode: "isolated" });
  return workspace;
}

afterEach(() => {
  while (roots.length > 0) {
    const workspace = roots.pop();
    if (workspace) {
      rmSync(workspace, { recursive: true, force: true });
    }
  }
});

async function appendWithWriters(params: {
  workspace: string;
  writers: number;
  eventsPerWriter: number;
}): Promise<{ elapsedMs: number; totalEvents: number }> {
  const { workspace, writers, eventsPerWriter } = params;
  const ledgers = Array.from({ length: writers }, () => openLedger(workspace));
  const sessions = ledgers.map((_, index) => `writer-${index}`);

  for (let i = 0; i < ledgers.length; i += 1) {
    ledgers[i]!.startSession({
      sessionId: sessions[i]!,
      runtime: "unknown",
      binaryPath: "perf",
      binarySha256: `writer-${i}`
    });
  }

  const started = performance.now();
  try {
    await Promise.all(
      ledgers.map((ledger, writerIndex) =>
        (async () => {
          for (let i = 0; i < eventsPerWriter; i += 1) {
            ledger.appendEvidence({
              sessionId: sessions[writerIndex]!,
              runtime: "unknown",
              eventType: "stdout",
              payload: `writer=${writerIndex};event=${i}`,
              inline: true,
              meta: {
                agentId: "perf-agent",
                writerIndex,
                seq: i,
                questionId: "AMC-1.7"
              }
            });
            if (i % 10 === 0) {
              await waitImmediate();
            }
          }
        })()
      )
    );
  } finally {
    for (let i = 0; i < ledgers.length; i += 1) {
      ledgers[i]!.sealSession(sessions[i]!);
      ledgers[i]!.close();
    }
  }

  return {
    elapsedMs: performance.now() - started,
    totalEvents: writers * eventsPerWriter
  };
}

describe("performance: ledger concurrent append", () => {
  test("maintains integrity under interleaved concurrent writers", async () => {
    const writers = 6;
    const eventsPerWriter = 120;

    const concurrentWorkspace = newWorkspace("amc-perf-ledger-concurrent-");
    const concurrent = await appendWithWriters({
      workspace: concurrentWorkspace,
      writers,
      eventsPerWriter
    });
    const concurrentVerify = await verifyLedgerIntegrity(concurrentWorkspace);

    const serialWorkspace = newWorkspace("amc-perf-ledger-serial-");
    const serial = await appendWithWriters({
      workspace: serialWorkspace,
      writers: 1,
      eventsPerWriter: writers * eventsPerWriter
    });
    const serialVerify = await verifyLedgerIntegrity(serialWorkspace);

    expect(concurrentVerify.ok).toBe(true);
    expect(serialVerify.ok).toBe(true);

    // Concurrency can be slower due lock arbitration, but should stay in the same order of magnitude.
    expect(concurrent.elapsedMs).toBeLessThan(serial.elapsedMs * 6);

    console.info("[perf][ledger-concurrency]", {
      concurrentMs: Number(concurrent.elapsedMs.toFixed(3)),
      serialMs: Number(serial.elapsedMs.toFixed(3)),
      concurrentEvents: concurrent.totalEvents,
      serialEvents: serial.totalEvents,
      concurrentThroughputPerSec: Number((concurrent.totalEvents / Math.max(concurrent.elapsedMs, 0.001) * 1000).toFixed(2)),
      serialThroughputPerSec: Number((serial.totalEvents / Math.max(serial.elapsedMs, 0.001) * 1000).toFixed(2))
    });
  });
});
