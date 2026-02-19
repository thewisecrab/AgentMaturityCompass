/**
 * Numeric range and plausibility checker.
 */

export interface NumericCheckResult {
  valid: boolean;
  flags: string[];
}

export function checkNumeric(value: number, opts: {
  min?: number;
  max?: number;
  maxMagnitude?: number;
  currency?: boolean;
}): NumericCheckResult {
  const flags: string[] = [];

  if (!Number.isFinite(value)) { flags.push('Value is not finite'); }
  if (Number.isNaN(value)) { flags.push('Value is NaN'); }
  if (opts.min !== undefined && value < opts.min) { flags.push(`Below minimum: ${opts.min}`); }
  if (opts.max !== undefined && value > opts.max) { flags.push(`Above maximum: ${opts.max}`); }
  if (opts.maxMagnitude !== undefined && Math.abs(value) > opts.maxMagnitude) {
    flags.push(`Exceeds max magnitude: ${opts.maxMagnitude}`);
  }
  if (opts.currency) {
    const decimals = value.toString().split('.')[1]?.length ?? 0;
    if (decimals > 2) flags.push('Currency value has more than 2 decimal places');
    if (value < 0) flags.push('Negative currency value');
  }

  return { valid: flags.length === 0, flags };
}
