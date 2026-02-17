export function pythonRequestsSnippet(params: { routeUrl: string; agentId: string }): string {
  return [
    "import json",
    "import os",
    "import time",
    "import urllib.request",
    `route = os.getenv('OPENAI_BASE_URL', ${JSON.stringify(params.routeUrl)})`,
    `agent_id = os.getenv('AMC_AGENT_ID', ${JSON.stringify(params.agentId)})`,
    "payload = json.dumps({'model': os.getenv('AMC_MODEL', 'gpt-4o-mini'), 'messages': [{'role': 'user', 'content': 'ping'}]}).encode('utf-8')",
    "req = urllib.request.Request(f\"{route}/v1/chat/completions\", data=payload, method='POST')",
    "req.add_header('content-type', 'application/json')",
    "req.add_header('x-amc-agent-id', agent_id)",
    "lease = os.getenv('AMC_LEASE', '')",
    "if lease:",
    "    req.add_header('Authorization', f'Bearer {lease}')",
    "with urllib.request.urlopen(req) as resp:",
    "    body = resp.read().decode('utf-8')",
    "    trace = {",
    "      'amc_trace_v': 1,",
    "      'ts': int(time.time() * 1000),",
    "      'agentId': agent_id,",
    "      'event': 'llm_result',",
    "      'request_id': resp.headers.get('x-amc-request-id'),",
    "      'receipt': resp.headers.get('x-amc-receipt')",
    "    }",
    "    print(json.dumps(trace, separators=(',', ':')))",
    "    print(body)"
  ].join("\n");
}

