export async function postToolIntent(params: {
  studioBaseUrl: string;
  lease: string;
  body: Record<string, unknown>;
}): Promise<{ status: number; body: string }> {
  const response = await fetch(`${params.studioBaseUrl}/toolhub/intent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-amc-lease": params.lease
    },
    body: JSON.stringify(params.body)
  });
  return {
    status: response.status,
    body: await response.text()
  };
}

export async function postToolExecute(params: {
  studioBaseUrl: string;
  lease: string;
  body: Record<string, unknown>;
}): Promise<{ status: number; body: string }> {
  const response = await fetch(`${params.studioBaseUrl}/toolhub/execute`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-amc-lease": params.lease
    },
    body: JSON.stringify(params.body)
  });
  return {
    status: response.status,
    body: await response.text()
  };
}
