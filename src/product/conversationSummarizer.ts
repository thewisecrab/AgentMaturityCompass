export interface SummaryResult { summary: string; turnCount: number; }

export function summarizeConversation(messages: Array<{ role: string; content: string }>): SummaryResult {
  return { summary: messages.map(m => `${m.role}: ${m.content.slice(0, 50)}`).join('\n'), turnCount: messages.length };
}
