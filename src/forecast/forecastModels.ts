import { predictWithBand, theilSen, ewma } from "./robustStats.js";
import type { ForecastSeries } from "./forecastSchema.js";

export const FORECAST_MODEL_VERSION = "theil_sen_v1";

export function fitSeriesForecast(params: {
  points: Array<{ ts: number; value: number; runId?: string; trustTier?: string }>;
  horizons: { shortDays: number; midDays: number; longDays: number };
}): ForecastSeries {
  const sorted = [...params.points].sort((a, b) => a.ts - b.ts);
  const points = sorted.map((point) => ({
    ts: point.ts,
    value: Number(point.value.toFixed(6)),
    runId: point.runId,
    trustTier: point.trustTier
  }));
  if (points.length === 0) {
    return {
      points,
      trend: null,
      forecast: {
        short: null,
        mid: null,
        long: null
      }
    };
  }

  const baseTs = points[0]!.ts;
  const x = points.map((point) => (point.ts - baseTs) / 86_400_000);
  const y = points.map((point) => point.value);
  const model = theilSen(x, y);
  const ewmaNow = ewma(y, 0.35);
  const n = points.length;
  const lastX = x[x.length - 1] ?? 0;

  const shortX = lastX + params.horizons.shortDays;
  const midX = lastX + params.horizons.midDays;
  const longX = lastX + params.horizons.longDays;

  const short = predictWithBand({
    model,
    atX: shortX,
    n,
    horizonFactor: params.horizons.shortDays
  });
  const mid = predictWithBand({
    model,
    atX: midX,
    n,
    horizonFactor: params.horizons.midDays
  });
  const long = predictWithBand({
    model,
    atX: longX,
    n,
    horizonFactor: params.horizons.longDays
  });

  return {
    points,
    trend: {
      slope: Number(model.slope.toFixed(8)),
      intercept: Number(model.intercept.toFixed(8)),
      robustSigma: Number(model.robustSigma.toFixed(8)),
      ewmaNow: Number(ewmaNow.toFixed(8)),
      sampleSize: n,
      outlierCount: model.outlierIndexes.length,
      changePoints: []
    },
    forecast: {
      short: {
        atTs: points[points.length - 1]!.ts + params.horizons.shortDays * 86_400_000,
        value: Number(short.value.toFixed(6)),
        low: Number(short.low.toFixed(6)),
        high: Number(short.high.toFixed(6))
      },
      mid: {
        atTs: points[points.length - 1]!.ts + params.horizons.midDays * 86_400_000,
        value: Number(mid.value.toFixed(6)),
        low: Number(mid.low.toFixed(6)),
        high: Number(mid.high.toFixed(6))
      },
      long: {
        atTs: points[points.length - 1]!.ts + params.horizons.longDays * 86_400_000,
        value: Number(long.value.toFixed(6)),
        low: Number(long.low.toFixed(6)),
        high: Number(long.high.toFixed(6))
      }
    }
  };
}
