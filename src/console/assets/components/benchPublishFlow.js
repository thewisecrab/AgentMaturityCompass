export async function requestBenchPublish(apiPost, params) {
  return apiPost("/bench/publish", {
    mode: "request",
    agentId: params.agentId,
    file: params.file,
    registryDir: params.registryDir,
    registryKeyPath: params.registryKeyPath,
    explicitOwnerAck: Boolean(params.explicitOwnerAck)
  });
}

export async function executeBenchPublish(apiPost, params) {
  return apiPost("/bench/publish", {
    mode: "execute",
    approvalRequestId: params.approvalRequestId
  });
}
