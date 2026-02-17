import { appendTransparencyEntry } from "../transparency/logChain.js";
import { sha256Hex } from "../utils/hash.js";
import { canonicalize } from "../utils/json.js";
import {
  generateStandardSchemas,
  listStandardSchemas,
  readStandardSchema,
  validateWithStandard,
  verifyStandardSchemas
} from "./standardGenerator.js";
import { standardMetaSchema, standardSchemaNameSchema } from "./standardSchema.js";

type StandardSchemaName = ReturnType<typeof standardSchemaNameSchema.parse>;

export function standardGenerateForApi(workspace: string) {
  const generated = generateStandardSchemas(workspace);
  const entry = appendTransparencyEntry({
    workspace,
    type: "STANDARD_SCHEMAS_GENERATED",
    agentId: "workspace",
    artifact: {
      kind: "policy",
      sha256: sha256Hex(Buffer.from(canonicalize({
        root: generated.root,
        schemasDir: generated.schemasDir,
        metaPath: generated.metaPath,
        metaSigPath: generated.metaSigPath,
        schemasSigPath: generated.schemasSigPath,
        schemaNames: generated.schemaNames
      }), "utf8")),
      id: "standard-schemas"
    }
  });
  return {
    ...generated,
    transparencyHash: entry.hash
  };
}

export function standardVerifyForApi(workspace: string) {
  const verified = verifyStandardSchemas(workspace);
  const entry = appendTransparencyEntry({
    workspace,
    type: "STANDARD_SCHEMAS_VERIFIED",
    agentId: "workspace",
    artifact: {
      kind: "policy",
      sha256: sha256Hex(Buffer.from(canonicalize({
        ok: verified.ok,
        errors: verified.errors,
        meta: verified.meta
      }), "utf8")),
      id: "standard-schemas-verify"
    }
  });
  return {
    ...verified,
    transparencyHash: entry.hash
  };
}

export function standardSchemasForApi(workspace: string): {
  schemas: Array<{ name: StandardSchemaName; sha256: string }>;
  meta: ReturnType<typeof standardMetaSchema.parse> | null;
  verify: ReturnType<typeof verifyStandardSchemas>;
} {
  const verify = verifyStandardSchemas(workspace);
  return {
    schemas: listStandardSchemas(workspace),
    meta: verify.meta,
    verify
  };
}

export function standardSchemaReadForApi(workspace: string, id: string): {
  name: StandardSchemaName;
  schema: Record<string, unknown>;
} {
  return readStandardSchema(workspace, id);
}

export function standardValidateForApi(params: {
  workspace: string;
  schemaId: string;
  file: string;
}) {
  return validateWithStandard(params);
}
