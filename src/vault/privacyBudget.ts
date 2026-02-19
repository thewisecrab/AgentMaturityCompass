/**
 * Privacy budget tracking — differential privacy budget management.
 */

export interface PrivacyBudgetResult {
  allowed: boolean;
  remaining: number;
  consumed: number;
}

export class PrivacyBudget {
  private budgets = new Map<string, number>();

  check(entityId: string, cost: number, totalBudget?: number): PrivacyBudgetResult {
    const budget = totalBudget ?? 1.0;
    const consumed = this.budgets.get(entityId) ?? 0;
    const newConsumed = consumed + cost;

    if (newConsumed > budget) {
      return { allowed: false, remaining: Math.max(0, budget - consumed), consumed };
    }

    this.budgets.set(entityId, newConsumed);
    return { allowed: true, remaining: budget - newConsumed, consumed: newConsumed };
  }
}
