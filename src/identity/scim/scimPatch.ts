export interface ScimPatchOperation {
  op: "add" | "remove" | "replace";
  path?: string;
  value?: unknown;
}

export function parseScimPatchOperations(input: unknown): ScimPatchOperation[] {
  if (!input || typeof input !== "object") {
    throw new Error("invalid PATCH body");
  }
  const operations = (input as { Operations?: unknown }).Operations;
  if (!Array.isArray(operations)) {
    throw new Error("PATCH Operations must be an array");
  }
  return operations.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("invalid PATCH operation");
    }
    const opRaw = (item as { op?: unknown }).op;
    const op = typeof opRaw === "string" ? opRaw.toLowerCase() : "";
    if (op !== "add" && op !== "remove" && op !== "replace") {
      throw new Error(`unsupported PATCH op: ${String(opRaw)}`);
    }
    const path = (item as { path?: unknown }).path;
    return {
      op,
      path: typeof path === "string" ? path : undefined,
      value: (item as { value?: unknown }).value
    };
  });
}
