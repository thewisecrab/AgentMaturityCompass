import { listPolicyPacks } from "../../policyPacks/builtInPacks.js";
import { listAssurancePacks } from "../../assurance/packs/index.js";
import { builtInComplianceMappings } from "../../compliance/builtInMappings.js";
import { listBuiltInAdapters } from "../../adapters/registry.js";
import { questionIds } from "../../diagnostic/questionBank.js";

export interface BuiltInAssetRegistry {
  policyPacks: Set<string>;
  assurancePacks: Set<string>;
  complianceMaps: Set<string>;
  adapters: Set<string>;
  outcomeTemplates: Set<string>;
  casebookTemplates: Set<string>;
  transformOverlays: Set<string>;
  learnIds: Set<string>;
}

export function builtInAssetRegistry(): BuiltInAssetRegistry {
  return {
    policyPacks: new Set(listPolicyPacks().map((row) => row.id)),
    assurancePacks: new Set(listAssurancePacks().map((row) => row.id)),
    complianceMaps: new Set(builtInComplianceMappings.map((row) => row.id)),
    adapters: new Set(listBuiltInAdapters().map((row) => row.id)),
    outcomeTemplates: new Set<string>(),
    casebookTemplates: new Set<string>(),
    transformOverlays: new Set<string>(),
    learnIds: new Set(questionIds)
  };
}
