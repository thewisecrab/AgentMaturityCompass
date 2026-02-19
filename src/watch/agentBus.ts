/**
 * Inter-agent messaging bus.
 */

import { createHash, randomUUID } from 'node:crypto';

export interface AgentMessage {
  messageId: string;
  from: string;
  to: string;
  payload: unknown;
  timestamp: Date;
  signature?: string;
}

export class AgentBus {
  private messages = new Map<string, AgentMessage[]>();

  send(from: string, to: string, payload: unknown): AgentMessage {
    const msg: AgentMessage = {
      messageId: randomUUID(),
      from,
      to,
      payload,
      timestamp: new Date(),
      signature: createHash('sha256').update(`${from}:${to}:${JSON.stringify(payload)}`).digest('hex'),
    };

    const existing = this.messages.get(to) ?? [];
    existing.push(msg);
    this.messages.set(to, existing);
    return msg;
  }

  receive(agentId: string): AgentMessage[] {
    const msgs = this.messages.get(agentId) ?? [];
    this.messages.delete(agentId);
    return msgs;
  }

  verify(message: AgentMessage): boolean {
    const expected = createHash('sha256')
      .update(`${message.from}:${message.to}:${JSON.stringify(message.payload)}`)
      .digest('hex');
    return expected === message.signature;
  }
}
