/**
 * Usage metering — tracks and bills resource consumption.
 */

import { randomUUID } from 'node:crypto';

export interface MeteringEvent {
  tenantId: string;
  eventType: string;
  units: number;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface MeteringBill {
  tenantId: string;
  totalUnits: number;
  invoiceId: string;
  period: string;
}

export class Metering {
  private events: MeteringEvent[] = [];

  record(event: Omit<MeteringEvent, 'timestamp'>): MeteringEvent {
    const full: MeteringEvent = { ...event, timestamp: new Date() };
    this.events.push(full);
    return full;
  }

  getBill(tenantId: string): MeteringBill {
    const tenantEvents = this.events.filter(e => e.tenantId === tenantId);
    const totalUnits = tenantEvents.reduce((sum, e) => sum + e.units, 0);
    const now = new Date();
    return {
      tenantId,
      totalUnits,
      invoiceId: randomUUID(),
      period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    };
  }
}
