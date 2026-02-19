import { randomUUID } from 'node:crypto';

export interface ReminderRecord { id: string; userId: string; message: string; atMs: number; cancelled: boolean; }
export interface Reminder { reminderId: string; message: string; triggerAt: Date; }

export class ReminderManager {
  private reminders = new Map<string, ReminderRecord>();

  scheduleReminder(userId: string, message: string, atMs: number): ReminderRecord {
    const r: ReminderRecord = { id: randomUUID(), userId, message, atMs, cancelled: false };
    this.reminders.set(r.id, r);
    return r;
  }

  getReminders(userId: string): ReminderRecord[] {
    return [...this.reminders.values()].filter(r => r.userId === userId && !r.cancelled);
  }

  cancelReminder(id: string): boolean {
    const r = this.reminders.get(id);
    if (!r) return false;
    r.cancelled = true;
    return true;
  }

  checkDue(): ReminderRecord[] {
    const now = Date.now();
    return [...this.reminders.values()].filter(r => !r.cancelled && r.atMs <= now);
  }
}

export function createReminder(message: string, delayMs: number): Reminder {
  return { reminderId: randomUUID(), message, triggerAt: new Date(Date.now() + delayMs) };
}
