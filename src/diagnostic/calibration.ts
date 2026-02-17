import type {
  CalibrationBin,
  CalibrationReport,
  DiagnosticReport,
  QuestionScore
} from "../types.js";

interface ConfidenceAccuracyPair {
  confidence: number;
  accuracy: number;
  questionId: string;
}

interface BinStats {
  binIndex: number;
  binLowerBound: number;
  binUpperBound: number;
  pairs: ConfidenceAccuracyPair[];
}

function createBins(numBins: number): BinStats[] {
  const bins: BinStats[] = [];
  for (let i = 0; i < numBins; i++) {
    const lowerBound = i / numBins;
    const upperBound = (i + 1) / numBins;
    bins.push({
      binIndex: i,
      binLowerBound: lowerBound,
      binUpperBound: upperBound,
      pairs: []
    });
  }
  return bins;
}

function assignToBin(bins: BinStats[], confidence: number): BinStats | null {
  const clampedConfidence = Math.max(0, Math.min(1, confidence));

  for (const bin of bins) {
    if (clampedConfidence >= bin.binLowerBound && clampedConfidence < bin.binUpperBound) {
      return bin;
    }
  }

  if (bins.length > 0) {
    const lastBin = bins[bins.length - 1];
    if (clampedConfidence === 1.0 && lastBin) {
      return lastBin;
    }
  }

  return null;
}

function computeCalibrationBins(pairs: ConfidenceAccuracyPair[], numBins: number): CalibrationBin[] {
  const bins = createBins(numBins);

  for (const pair of pairs) {
    const bin = assignToBin(bins, pair.confidence);
    if (bin) {
      bin.pairs.push(pair);
    }
  }

  const result: CalibrationBin[] = [];
  for (const bin of bins) {
    const avgConfidence = bin.pairs.length > 0
      ? bin.pairs.reduce((sum, p) => sum + p.confidence, 0) / bin.pairs.length
      : (bin.binLowerBound + bin.binUpperBound) / 2;

    const avgAccuracy = bin.pairs.length > 0
      ? bin.pairs.reduce((sum, p) => sum + p.accuracy, 0) / bin.pairs.length
      : 0.5;

    result.push({
      binIndex: bin.binIndex,
      binLowerBound: bin.binLowerBound,
      binUpperBound: bin.binUpperBound,
      avgConfidence: Number(avgConfidence.toFixed(4)),
      avgAccuracy: Number(avgAccuracy.toFixed(4)),
      sampleCount: bin.pairs.length
    });
  }

  return result;
}

function extractConfidenceAccuracyPairs(
  reports: DiagnosticReport[]
): ConfidenceAccuracyPair[] {
  if (reports.length < 2) {
    return [];
  }

  const pairs: ConfidenceAccuracyPair[] = [];

  for (let i = 0; i < reports.length - 1; i++) {
    const reportN = reports[i];
    const reportN1 = reports[i + 1];
    if (!reportN || !reportN1) {
      continue;
    }

    const scoresMap = new Map<string, QuestionScore>();
    for (const score of reportN1.questionScores) {
      scoresMap.set(score.questionId, score);
    }

    for (const scoreN of reportN.questionScores) {
      const scoreN1 = scoresMap.get(scoreN.questionId);
      if (!scoreN1) {
        continue;
      }

      const confidence = Math.max(0, Math.min(1, scoreN.confidence));
      const levelHeld = scoreN1.finalLevel >= scoreN.finalLevel ? 1 : 0;

      pairs.push({
        confidence,
        accuracy: levelHeld,
        questionId: scoreN.questionId
      });
    }
  }

  return pairs;
}

function computeECE(bins: CalibrationBin[]): number {
  const totalSamples = bins.reduce((sum, bin) => sum + bin.sampleCount, 0);

  if (totalSamples === 0) {
    return 0;
  }

  let ece = 0;
  for (const bin of bins) {
    const weight = bin.sampleCount / totalSamples;
    const calibrationError = Math.abs(bin.avgAccuracy - bin.avgConfidence);
    ece += weight * calibrationError;
  }

  return Number(ece.toFixed(4));
}

function computeMCE(bins: CalibrationBin[]): number {
  let mce = 0;
  for (const bin of bins) {
    const calibrationError = Math.abs(bin.avgAccuracy - bin.avgConfidence);
    mce = Math.max(mce, calibrationError);
  }
  return Number(mce.toFixed(4));
}

function computeBrierScore(pairs: ConfidenceAccuracyPair[]): number {
  if (pairs.length === 0) {
    return 0;
  }

  const sumSquaredError = pairs.reduce((sum, pair) => {
    const error = pair.confidence - pair.accuracy;
    return sum + error * error;
  }, 0);

  return Number((sumSquaredError / pairs.length).toFixed(4));
}

function findConfidenceDeltaPerQuestion(
  pairs: ConfidenceAccuracyPair[]
): Map<string, { confidences: number[]; accuracies: number[] }> {
  const byQuestion = new Map<string, { confidences: number[]; accuracies: number[] }>();

  for (const pair of pairs) {
    const entry = byQuestion.get(pair.questionId) ?? { confidences: [], accuracies: [] };
    entry.confidences.push(pair.confidence);
    entry.accuracies.push(pair.accuracy);
    byQuestion.set(pair.questionId, entry);
  }

  return byQuestion;
}

function identifyProblematicQuestions(
  pairs: ConfidenceAccuracyPair[],
  threshold: number = 0.2
): { overconfident: string[]; underconfident: string[] } {
  const byQuestion = findConfidenceDeltaPerQuestion(pairs);

  const overconfident: string[] = [];
  const underconfident: string[] = [];

  for (const [questionId, data] of byQuestion.entries()) {
    const avgConfidence = data.confidences.reduce((sum, c) => sum + c, 0) / data.confidences.length;
    const avgAccuracy = data.accuracies.reduce((sum, a) => sum + a, 0) / data.accuracies.length;

    if (avgConfidence > avgAccuracy + threshold) {
      overconfident.push(questionId);
    } else if (avgAccuracy > avgConfidence + threshold) {
      underconfident.push(questionId);
    }
  }

  return { overconfident, underconfident };
}

export function computeCalibration(
  reports: DiagnosticReport[],
  numBins: number = 10
): CalibrationReport {
  if (reports.length === 0) {
    return {
      agentId: "",
      windowRunIds: [],
      numRuns: 0,
      numQuestionScorePairs: 0,
      expectedCalibrationError: 0,
      maxCalibrationError: 0,
      brierScore: 0,
      bins: [],
      overconfidentQuestions: [],
      underconfidentQuestions: [],
      ts: 0
    };
  }

  const sortedReports = [...reports].sort((a, b) => a.ts - b.ts);
  const pairs = extractConfidenceAccuracyPairs(sortedReports);
  const bins = computeCalibrationBins(pairs, numBins);
  const ece = computeECE(bins);
  const mce = computeMCE(bins);
  const brier = computeBrierScore(pairs);
  const { overconfident, underconfident } = identifyProblematicQuestions(pairs);

  const firstReport = sortedReports[0];
  const lastReport = sortedReports[sortedReports.length - 1];
  const agentId = firstReport ? firstReport.agentId : "";
  const windowRunIds = sortedReports.map((r) => r.runId);
  const ts = lastReport ? lastReport.ts : 0;

  return {
    agentId,
    windowRunIds,
    numRuns: sortedReports.length,
    numQuestionScorePairs: pairs.length,
    expectedCalibrationError: ece,
    maxCalibrationError: mce,
    brierScore: brier,
    bins,
    overconfidentQuestions: overconfident,
    underconfidentQuestions: underconfident,
    ts
  };
}

export function computeCalibratedConfidence(
  questionId: string,
  rawConfidence: number,
  reports: DiagnosticReport[]
): number {
  if (reports.length < 3) {
    return rawConfidence;
  }

  const calibReport = computeCalibration(reports);

  const clampedConfidence = Math.max(0, Math.min(1, rawConfidence));
  let bestBin: CalibrationBin | null = null;
  let bestDist = Infinity;

  for (const bin of calibReport.bins) {
    const binCenter = (bin.binLowerBound + bin.binUpperBound) / 2;
    const dist = Math.abs(binCenter - clampedConfidence);
    if (dist < bestDist) {
      bestDist = dist;
      bestBin = bin;
    }
  }

  if (!bestBin || bestBin.sampleCount === 0) {
    return rawConfidence;
  }

  return Math.max(0, Math.min(1, bestBin.avgAccuracy));
}

export function formatCalibrationSummary(report: CalibrationReport): string {
  const eceRating =
    report.expectedCalibrationError < 0.05
      ? "EXCELLENT"
      : report.expectedCalibrationError < 0.1
        ? "GOOD"
        : report.expectedCalibrationError < 0.2
          ? "FAIR"
          : "POOR";

  let summary = `## Calibration Summary\n\n`;
  summary += `**Agent ID:** ${report.agentId}\n`;
  summary += `**Number of Runs:** ${report.numRuns}\n`;
  summary += `**Question-Score Pairs:** ${report.numQuestionScorePairs}\n\n`;

  summary += `### Overall Calibration Quality\n\n`;
  summary += `- **ECE Rating:** ${eceRating}\n`;
  summary += `- **Expected Calibration Error:** ${report.expectedCalibrationError.toFixed(4)}\n`;
  summary += `- **Max Calibration Error:** ${report.maxCalibrationError.toFixed(4)}\n`;
  summary += `- **Brier Score:** ${report.brierScore.toFixed(4)}\n\n`;

  if (report.overconfidentQuestions.length > 0) {
    summary += `### Overconfident Questions\n\n`;
    summary += `The following questions show confidence exceeding accuracy by >20%:\n\n`;
    for (const qId of report.overconfidentQuestions) {
      summary += `- **${qId}**: Reduce confidence claims or collect more evidence.\n`;
    }
    summary += `\n`;
  }

  if (report.underconfidentQuestions.length > 0) {
    summary += `### Underconfident Questions\n\n`;
    summary += `The following questions show accuracy exceeding confidence by >20%:\n\n`;
    for (const qId of report.underconfidentQuestions) {
      summary += `- **${qId}**: Increase confidence score; evidence supports higher assessment.\n`;
    }
    summary += `\n`;
  }

  summary += `### Confidence Distribution by Bin\n\n`;
  summary += `| Bin | Range | Avg Confidence | Avg Accuracy | Samples |\n`;
  summary += `|-----|-------|---|---|---|\n`;
  for (const bin of report.bins) {
    const range = `${(bin.binLowerBound * 100).toFixed(0)}%-${(bin.binUpperBound * 100).toFixed(0)}%`;
    summary += `| ${bin.binIndex} | ${range} | ${bin.avgConfidence.toFixed(3)} | ${bin.avgAccuracy.toFixed(3)} | ${bin.sampleCount} |\n`;
  }

  return summary;
}
