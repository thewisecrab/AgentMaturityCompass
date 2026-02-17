export function nodeFetchSnippet(params: { routeUrl: string; agentId: string }): string {
  return [
    "import { wrapFetch } from 'agent-maturity-compass';",
    "import { logTrace } from 'agent-maturity-compass';",
    `const route = process.env.OPENAI_BASE_URL || ${JSON.stringify(params.routeUrl)};`,
    `const agentId = process.env.AMC_AGENT_ID || ${JSON.stringify(params.agentId)};`,
    "const fetchWithAmc = wrapFetch(fetch, { agentId, gatewayBaseUrl: route, forceBaseUrl: true });",
    "const headers = {",
    "  'content-type': 'application/json',",
    "  'x-amc-agent-id': agentId,",
    "  ...(process.env.AMC_LEASE ? { authorization: `Bearer ${process.env.AMC_LEASE}` } : {})",
    "};",
    "const resp = await fetchWithAmc(`${route}/v1/chat/completions`, {",
    "  method: 'POST',",
    "  headers,",
    "  body: JSON.stringify({ model: process.env.AMC_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] })",
    "});",
    "logTrace({ amc_trace_v: 1, ts: Date.now(), agentId, event: 'llm_result', request_id: resp.headers.get('x-amc-request-id') || undefined, receipt: resp.headers.get('x-amc-receipt') || undefined });",
    "console.log(await resp.text());"
  ].join("\n");
}

