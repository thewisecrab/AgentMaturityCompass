/**
 * Tool invocation contracts — validates tool calls against contracts.
 */

export interface ToolContract {
  toolName: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  maxLatencyMs: number;
  requiredPermissions: string[];
}

export interface ContractCheckResult {
  valid: boolean;
  violations: string[];
}

export function checkContract(
  toolName: string,
  args: Record<string, unknown>,
  contract: ToolContract,
): ContractCheckResult {
  const violations: string[] = [];

  if (toolName !== contract.toolName) {
    violations.push(`Tool name mismatch: expected ${contract.toolName}, got ${toolName}`);
  }

  // Check required fields from input schema
  const required = (contract.inputSchema['required'] as string[]) ?? [];
  for (const field of required) {
    if (!(field in args)) violations.push(`Missing required field: ${field}`);
  }

  return { valid: violations.length === 0, violations };
}
