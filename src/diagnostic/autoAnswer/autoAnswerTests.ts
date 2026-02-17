import type { DiagnosticReport } from "../../types.js";
import { deriveAutoAnswerResults } from "./autoAnswerEvidenceQueries.js";

export function autoAnswerDeterminismProbe(report: DiagnosticReport): {
  a: ReturnType<typeof deriveAutoAnswerResults>;
  b: ReturnType<typeof deriveAutoAnswerResults>;
} {
  const a = deriveAutoAnswerResults(report);
  const b = deriveAutoAnswerResults(report);
  return { a, b };
}
