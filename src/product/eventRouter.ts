import { randomUUID } from 'node:crypto';

export interface Route { id: string; pattern: string | RegExp; handler: string; }
export interface RoutedEvent { eventId: string; destination: string; handled: boolean; }

export class EventRouter {
  private routes = new Map<string, Route>();

  addRoute(pattern: string | RegExp, handler: string): string {
    const id = randomUUID();
    this.routes.set(id, { id, pattern, handler });
    return id;
  }

  route(event: { type: string; payload: unknown }): { handler: string; matched: boolean }[] {
    const results: { handler: string; matched: boolean }[] = [];
    for (const r of this.routes.values()) {
      let matched = false;
      if (typeof r.pattern === 'string') {
        const regex = new RegExp('^' + r.pattern.replace(/\*/g, '.*') + '$');
        matched = regex.test(event.type);
      } else {
        matched = r.pattern.test(event.type);
      }
      if (matched) results.push({ handler: r.handler, matched: true });
    }
    return results;
  }

  removeRoute(id: string): boolean { return this.routes.delete(id); }
  getRoutes(): Route[] { return [...this.routes.values()]; }
}

export function routeEvent(eventType: string, _payload: unknown): RoutedEvent {
  return { eventId: randomUUID(), destination: eventType, handled: true };
}
