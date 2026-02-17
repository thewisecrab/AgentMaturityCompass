export function parseBenchGroupBy(value?: string): "archetype" | "riskTier" | "trustLabel" {
  const normalized = (value ?? "riskTier").trim();
  if (normalized === "archetype" || normalized === "riskTier" || normalized === "trustLabel") {
    return normalized;
  }
  throw new Error(`Invalid --group-by value '${value}'. Expected archetype|riskTier|trustLabel.`);
}

