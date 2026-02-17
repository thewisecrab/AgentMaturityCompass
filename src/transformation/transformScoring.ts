import type { TransformTask } from "./transformTasks.js";

export function percentDone(tasks: TransformTask[]): number {
  if (tasks.length === 0) {
    return 0;
  }
  const done = tasks.filter((task) => task.status === "DONE" || task.status === "ATTESTED").length;
  return Number(((done / tasks.length) * 100).toFixed(2));
}

export function topBlockers(tasks: TransformTask[], limit = 5): string[] {
  return tasks
    .filter((task) => task.status === "BLOCKED")
    .map((task) => `${task.taskId}: ${task.statusReason || "missing evidence"}`)
    .slice(0, limit);
}

export function nextTasks(tasks: TransformTask[], limit = 3): string[] {
  return tasks
    .filter((task) => task.status === "NOT_STARTED" || task.status === "IN_PROGRESS" || task.status === "BLOCKED")
    .sort((a, b) => a.priority - b.priority || a.effort - b.effort || a.taskId.localeCompare(b.taskId))
    .slice(0, limit)
    .map((task) => task.taskId);
}
