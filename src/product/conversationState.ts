import { randomUUID } from 'node:crypto';

export interface Turn { role: string; content: string; timestamp: number; }
export interface ConvState { turns: Turn[]; topic: string; lastActivity: number; }
export interface ConversationState { stateId: string; turn: number; topic: string; }

export class ConversationManager {
  private conversations = new Map<string, { id: string; agentId: string; turns: Turn[] }>();

  createConversation(agentId: string): string {
    const id = randomUUID();
    this.conversations.set(id, { id, agentId, turns: [] });
    return id;
  }

  addTurn(convId: string, role: string, content: string): Turn {
    const conv = this.conversations.get(convId);
    if (!conv) throw new Error('Conversation not found');
    const turn: Turn = { role, content, timestamp: Date.now() };
    conv.turns.push(turn);
    return turn;
  }

  getState(convId: string): ConvState {
    const conv = this.conversations.get(convId);
    if (!conv) throw new Error('Conversation not found');
    const topic = conv.turns.length > 0 ? conv.turns[0]!.content.slice(0, 50) : '';
    const lastActivity = conv.turns.length > 0 ? conv.turns[conv.turns.length - 1]!.timestamp : 0;
    return { turns: conv.turns, topic, lastActivity };
  }

  summarize(convId: string): string {
    const conv = this.conversations.get(convId);
    if (!conv) return '';
    return conv.turns.map(t => `${t.role}: ${t.content.split('.')[0]}`).join('; ');
  }
}

export function trackConversationState(topic: string, turn: number): ConversationState {
  return { stateId: randomUUID(), turn, topic };
}
