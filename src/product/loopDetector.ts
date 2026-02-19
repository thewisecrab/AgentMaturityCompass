/**
 * Infinite loop detection — detects repetitive agent actions.
 */

export interface LoopDetectionResult {
  loopDetected: boolean;
  pattern?: string;
  repetitionCount: number;
}

export class LoopDetector {
  private history = new Map<string, string[]>();

  check(sessionId: string, action: string): LoopDetectionResult {
    const actions = this.history.get(sessionId) ?? [];
    actions.push(action);
    this.history.set(sessionId, actions);

    // Check for repeating patterns of length 1-3
    for (const len of [1, 2, 3]) {
      if (actions.length >= len * 3) {
        const recent = actions.slice(-len);
        const prev1 = actions.slice(-len * 2, -len);
        const prev2 = actions.slice(-len * 3, -len * 2);
        if (JSON.stringify(recent) === JSON.stringify(prev1) && JSON.stringify(prev1) === JSON.stringify(prev2)) {
          return { loopDetected: true, pattern: recent.join(' → '), repetitionCount: 3 };
        }
      }
    }

    return { loopDetected: false, repetitionCount: 0 };
  }

  reset(sessionId: string): void {
    this.history.delete(sessionId);
  }
}
