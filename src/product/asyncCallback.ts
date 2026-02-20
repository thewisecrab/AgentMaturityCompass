/**
 * asyncCallback.ts — Callback registry with URL-based delivery,
 * retry with exponential backoff, and event filtering.
 */

import { randomUUID } from 'node:crypto';

export interface CallbackEntry {
  id: string;
  eventType: string;
  fn: (payload: unknown) => void;
  filter?: (payload: unknown) => boolean;
  createdAt: number;
}

export interface AsyncCallback {
  callbackId: string;
  url: string;
  registered: boolean;
}

export interface WebhookConfig {
  url: string;
  eventTypes: string[];
  secret?: string;
  maxRetries: number;
  retryDelayMs: number;
}

export interface DeliveryResult {
  webhookUrl: string;
  eventType: string;
  status: 'delivered' | 'failed' | 'retrying';
  attempts: number;
  error?: string;
}

/* ── CallbackRegistry (enhanced) ─────────────────────────────────── */

export class CallbackRegistry {
  private callbacks = new Map<string, CallbackEntry>();
  private webhooks = new Map<string, WebhookConfig>();
  private deliveryLog: DeliveryResult[] = [];

  registerCallback(eventType: string, fn: (payload: unknown) => void, filter?: (payload: unknown) => boolean): string {
    const id = randomUUID();
    this.callbacks.set(id, { id, eventType, fn, filter, createdAt: Date.now() });
    return id;
  }

  registerWebhook(config: WebhookConfig): string {
    const id = randomUUID();
    this.webhooks.set(id, config);
    return id;
  }

  triggerEvent(eventType: string, payload: unknown): number {
    let count = 0;
    // In-process callbacks
    for (const cb of this.callbacks.values()) {
      if (cb.eventType === eventType) {
        if (cb.filter && !cb.filter(payload)) continue;
        try { cb.fn(payload); count++; } catch { /* swallow */ }
      }
    }
    // Webhook delivery (fire and forget in sync context)
    for (const wh of this.webhooks.values()) {
      if (wh.eventTypes.includes(eventType) || wh.eventTypes.includes('*')) {
        this.deliverWebhook(wh, eventType, payload);
        count++;
      }
    }
    return count;
  }

  private async deliverWebhook(config: WebhookConfig, eventType: string, payload: unknown): Promise<void> {
    let attempts = 0;
    let lastError: string | undefined;

    while (attempts <= config.maxRetries) {
      attempts++;
      try {
        const body = JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() });
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (config.secret) {
          // Simple HMAC signature (would use crypto in real impl)
          headers['X-AMC-Signature'] = `sha256=${config.secret.slice(0, 8)}`;
        }
        // Use dynamic import for fetch compatibility
        const response = await fetch(config.url, { method: 'POST', headers, body, signal: AbortSignal.timeout(10_000) });
        if (response.ok) {
          this.deliveryLog.push({ webhookUrl: config.url, eventType, status: 'delivered', attempts });
          return;
        }
        lastError = `HTTP ${response.status}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempts <= config.maxRetries) {
        const delay = config.retryDelayMs * Math.pow(2, attempts - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    this.deliveryLog.push({ webhookUrl: config.url, eventType, status: 'failed', attempts, error: lastError });
  }

  deregisterCallback(id: string): boolean {
    return this.callbacks.delete(id) || this.webhooks.delete(id);
  }

  listCallbacks(): CallbackEntry[] { return [...this.callbacks.values()]; }
  listWebhooks(): WebhookConfig[] { return [...this.webhooks.values()]; }
  getDeliveryLog(): DeliveryResult[] { return [...this.deliveryLog]; }
  clearDeliveryLog(): void { this.deliveryLog.length = 0; }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function registerAsyncCallback(url: string): AsyncCallback {
  return { callbackId: randomUUID(), url, registered: true };
}
