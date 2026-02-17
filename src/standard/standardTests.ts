import { readUtf8 } from "../utils/fs.js";
import { canonicalize } from "../utils/json.js";
import { standardSchemasDir } from "./standardRegistry.js";
import { STANDARD_SCHEMA_NAMES } from "./standardSchema.js";

export function stableStandardSchemaSnapshot(workspace: string): string {
  const rows = STANDARD_SCHEMA_NAMES.map((name) => ({
    name,
    schema: JSON.parse(readUtf8(`${standardSchemasDir(workspace)}/${name}`)) as Record<string, unknown>
  }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({
      name: row.name,
      schema: row.schema
    }));
  return canonicalize(rows);
}

