import { resolve } from "node:path";
import { readUtf8 } from "../utils/fs.js";
import { validateTruthguardForWorkspace } from "./truthguardApi.js";
import { validateTruthguardOutput } from "./truthguardEngine.js";

export function truthguardValidateCli(params: {
  workspace: string;
  inputFile: string;
  enforceWorkspacePolicy?: boolean;
}) {
  const file = resolve(params.workspace, params.inputFile);
  const parsed = JSON.parse(readUtf8(file)) as unknown;
  if (params.enforceWorkspacePolicy ?? true) {
    return {
      file,
      ...validateTruthguardForWorkspace({
        workspace: params.workspace,
        output: parsed
      })
    };
  }
  return {
    file,
    result: validateTruthguardOutput({
      output: parsed,
      allowedTools: ["*"],
      allowedModels: ["*"]
    }),
    context: {
      allowedTools: ["*"],
      allowedModels: ["*"],
      evidenceBound: false
    }
  };
}
