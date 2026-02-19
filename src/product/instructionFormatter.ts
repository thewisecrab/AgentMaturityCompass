export interface FormattedInstruction { formatted: string; tokenEstimate: number; }

const FILLER_WORDS = /\b(just|really|very|basically|actually|simply|literally|quite|rather|somewhat|perhaps|maybe)\b/gi;

export function formatInstruction(instruction: string, style?: 'concise' | 'detailed' | 'structured'): FormattedInstruction {
  const s = style ?? 'concise';
  let formatted: string;
  if (s === 'concise') {
    formatted = instruction.replace(FILLER_WORDS, '').replace(/\s{2,}/g, ' ').trim();
  } else if (s === 'detailed') {
    formatted = `Context: The following instruction should be executed carefully.\n\nInstruction: ${instruction.trim()}\n\nNote: Ensure all steps are completed and verify the output.`;
  } else {
    const sentences = instruction.split(/[.;]\s*/).filter(Boolean);
    formatted = sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
  }
  const tokenEstimate = Math.ceil(formatted.split(/\s+/).length * 1.3);
  return { formatted, tokenEstimate };
}
