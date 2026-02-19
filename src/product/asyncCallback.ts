import { randomUUID } from 'node:crypto';

export interface CallbackEntry { id: string; eventType: string; fn: (payload: unknown) => void; }
export interface AsyncCallback { callbackId: string; url: string; registered: boolean; }

export class CallbackRegistry {
  private callbacks = new Map<string, CallbackEntry>();

  registerCallback(eventType: string, fn: (payload: unknown) => void): string {
    const id = randomUUID();
    this.callbacks.set(id, { id, eventType, fn });
    return id;
  }

  triggerEvent(eventType: string, payload: unknown): number {
    let count = 0;
    for (const cb of this.callbacks.values()) {
      if (cb.eventType === eventType) { cb.fn(payload); count++; }
    }
    return count;
  }

  deregisterCallback(id: string): boolean { return this.callbacks.delete(id); }
  listCallbacks(): CallbackEntry[] { return [...this.callbacks.values()]; }
}

export function registerAsyncCallback(url: string): AsyncCallback {
  return { callbackId: randomUUID(), url, registered: true };
}
