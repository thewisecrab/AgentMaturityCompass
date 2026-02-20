/**
 * eventRouter.ts — Event routing with configurable rules,
 * priority-based matching, delivery logging, and filtering.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export type EventType = 'webhook' | 'email' | 'db_trigger' | 'schedule' | 'manual';
export type TargetType = 'webhook' | 'email' | 'queue' | 'function' | 'log';

export interface RouteRule {
  routeId: string;
  name: string;
  eventType: EventType;
  sourceFilter: string;
  targetType: TargetType;
  targetConfig: Record<string, unknown>;
  enabled: boolean;
  priority: number;
  createdAt: number;
}

export interface EventPayload {
  eventType: EventType;
  source: string;
  data: unknown;
  timestamp?: number;
}

export interface DeliveryRecord {
  logId: string;
  routeId: string;
  eventType: EventType;
  source: string;
  status: 'delivered' | 'filtered' | 'error';
  deliveredAt: number;
  targetType: TargetType;
  error?: string;
}

/** Backward-compat shape from stubs.ts */
export interface RoutedEvent { eventId: string; destination: string; handled: boolean; }

/* ── Class ───────────────────────────────────────────────────────── */

export class EventRouter {
  private routes = new Map<string, RouteRule>();
  private deliveryLog: DeliveryRecord[] = [];

  createRoute(
    name: string, eventType: EventType, sourceFilter: string,
    targetType: TargetType, targetConfig: Record<string, unknown> = {},
    priority = 0, enabled = true,
  ): RouteRule {
    const rule: RouteRule = {
      routeId: randomUUID(), name, eventType, sourceFilter,
      targetType, targetConfig, enabled, priority,
      createdAt: Date.now(),
    };
    this.routes.set(rule.routeId, rule);
    return rule;
  }

  getRoute(routeId: string): RouteRule | undefined {
    return this.routes.get(routeId);
  }

  updateRoute(routeId: string, updates: Partial<Pick<RouteRule, 'name' | 'enabled' | 'priority' | 'targetConfig'>>): RouteRule {
    const rule = this.routes.get(routeId);
    if (!rule) throw new Error(`Route ${routeId} not found`);
    Object.assign(rule, updates);
    return rule;
  }

  removeRoute(routeId: string): boolean {
    return this.routes.delete(routeId);
  }

  listRoutes(eventType?: EventType, enabled?: boolean): RouteRule[] {
    let rules = [...this.routes.values()];
    if (eventType !== undefined) rules = rules.filter(r => r.eventType === eventType);
    if (enabled !== undefined) rules = rules.filter(r => r.enabled === enabled);
    return rules.sort((a, b) => b.priority - a.priority);
  }

  routeEvent(payload: EventPayload): DeliveryRecord[] {
    const records: DeliveryRecord[] = [];
    const matching = this.listRoutes(payload.eventType, true);

    for (const rule of matching) {
      const sourceMatch = rule.sourceFilter === '*' ||
        payload.source.toLowerCase().includes(rule.sourceFilter.toLowerCase());

      const record: DeliveryRecord = {
        logId: randomUUID(),
        routeId: rule.routeId,
        eventType: payload.eventType,
        source: payload.source,
        status: sourceMatch ? 'delivered' : 'filtered',
        deliveredAt: Date.now(),
        targetType: rule.targetType,
      };

      if (!sourceMatch) {
        records.push(record);
        this.deliveryLog.push(record);
        continue;
      }

      // Simulate delivery — real impl would invoke targets
      try {
        // Target-type specific validation
        if (rule.targetType === 'webhook' && !rule.targetConfig['url']) {
          throw new Error('Webhook target requires url in targetConfig');
        }
        if (rule.targetType === 'email' && !rule.targetConfig['to']) {
          throw new Error('Email target requires to in targetConfig');
        }
        record.status = 'delivered';
      } catch (err) {
        record.status = 'error';
        record.error = err instanceof Error ? err.message : String(err);
      }

      records.push(record);
      this.deliveryLog.push(record);
    }

    return records;
  }

  getDeliveryLog(routeId?: string, limit = 100): DeliveryRecord[] {
    let log = [...this.deliveryLog];
    if (routeId) log = log.filter(r => r.routeId === routeId);
    return log.slice(-limit);
  }

  getStats(): { totalRoutes: number; enabledRoutes: number; totalDeliveries: number; errors: number } {
    const routes = [...this.routes.values()];
    return {
      totalRoutes: routes.length,
      enabledRoutes: routes.filter(r => r.enabled).length,
      totalDeliveries: this.deliveryLog.length,
      errors: this.deliveryLog.filter(r => r.status === 'error').length,
    };
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function routeEvent(eventType: string, _payload: unknown): RoutedEvent {
  return { eventId: randomUUID(), destination: eventType, handled: true };
}
