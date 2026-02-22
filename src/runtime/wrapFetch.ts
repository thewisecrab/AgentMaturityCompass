import { logTrace } from "./traceLogger.js";

export interface WrapFetchOptions {
  agentId: string;
  gatewayBaseUrl: string;
  injectHeaders?: Record<string, string>;
  forceBaseUrl: boolean;
}

export type FetchLike = typeof fetch;

function providerFromGatewayBase(gatewayBaseUrl: string): string {
  try {
    const parsed = new URL(gatewayBaseUrl);
    const segment = parsed.pathname.split("/").find((item) => item.length > 0);
    return segment ?? "unknown";
  } catch {
    return "unknown";
  }
}

function inputUrl(input: RequestInfo | URL): string | null {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  if (typeof input === "object" && input !== null && "url" in input) {
    const candidate = (input as { url?: unknown }).url;
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

function joinPath(basePath: string, incomingPath: string): string {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const incoming = incomingPath.startsWith("/") ? incomingPath : `/${incomingPath}`;
  if (!base || base === "/") {
    return incoming;
  }
  if (incoming.startsWith(`${base}/`) || incoming === base) {
    return incoming;
  }
  return `${base}${incoming}`;
}

function rewriteUrl(original: string, gatewayBaseUrl: string): string {
  const from = new URL(original);
  const gateway = new URL(gatewayBaseUrl);
  const rewritten = new URL(gateway.toString());
  rewritten.pathname = joinPath(gateway.pathname, from.pathname);
  rewritten.search = from.search;
  return rewritten.toString();
}

function mergeHeaders(input: HeadersInit | undefined, append: Record<string, string>): Headers {
  const headers = new Headers(input ?? {});
  for (const [key, value] of Object.entries(append)) {
    headers.set(key, value);
  }
  return headers;
}

export function wrapFetch(originalFetch: FetchLike, opts: WrapFetchOptions): FetchLike {
  const providerId = providerFromGatewayBase(opts.gatewayBaseUrl);
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const incomingUrl = inputUrl(input);
    const finalUrl =
      opts.forceBaseUrl && incomingUrl
        ? rewriteUrl(incomingUrl, opts.gatewayBaseUrl)
        : input;

    const headers = mergeHeaders(init?.headers, {
      "x-amc-agent-id": opts.agentId,
      ...(process.env.AMC_LEASE ? { "x-amc-lease": process.env.AMC_LEASE } : {}),
      ...(process.env.AMC_WORKORDER_ID ? { "x-amc-workorder-id": process.env.AMC_WORKORDER_ID } : {}),
      ...(opts.injectHeaders ?? {})
    });
    const nextInit: RequestInit = {
      ...init,
      headers
    };

    logTrace({
      agentId: opts.agentId,
      event: "llm_call",
      providerId,
      note: typeof finalUrl === "string" ? finalUrl : incomingUrl ?? undefined
    });

    const response = await originalFetch(finalUrl as RequestInfo | URL, nextInit);
    const requestId =
      response.headers.get("x-amc-request-id")
      ?? response.headers.get("x-amc-bridge-request-id")
      ?? undefined;
    const receipt = response.headers.get("x-amc-receipt") ?? undefined;

    logTrace({
      agentId: opts.agentId,
      event: "llm_result",
      providerId,
      request_id: requestId,
      receipt,
      note: `status=${response.status}`
    });

    return response;
  }) as FetchLike;
}
