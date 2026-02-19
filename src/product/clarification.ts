export interface ClarificationResult { needsClarification: boolean; questions: string[]; }

export function checkClarification(input: string): ClarificationResult {
  const ambiguous = input.split(/\s+/).length < 5;
  return { needsClarification: ambiguous, questions: ambiguous ? ['Can you provide more details?'] : [] };
}
