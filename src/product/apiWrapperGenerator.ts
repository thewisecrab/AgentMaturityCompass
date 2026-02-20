/**
 * apiWrapperGenerator.ts — Tool wrapper generator from OpenAPI/Postman specs.
 *
 * Parses OpenAPI 3.x or Postman Collection v2.1 specs into typed tool endpoint
 * definitions with retry config, validation, and generated TypeScript code.
 * In-memory backed (no SQLite).
 *
 * Port of Python api_wrapper_generator.py
 */

import { randomUUID, createHash } from 'node:crypto';

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface ParameterDef {
  name: string;
  type: string;        // string | integer | boolean | number | array | object
  required: boolean;
  defaultValue?: unknown;
  description: string;
  enumValues: string[];
  validationPattern: string;
}

export interface ToolEndpoint {
  endpointId: string;
  name: string;
  description: string;
  method: string;      // GET | POST | PUT | DELETE | PATCH
  path: string;
  baseUrl: string;
  parameters: ParameterDef[];
  headers: Record<string, string>;
  responseSchema: Record<string, unknown>;
  tags: string[];
  retryConfig: { maxRetries: number; backoffFactor: number; retryOn: number[] };
  timeoutSeconds: number;
}

export interface GeneratedWrapper {
  wrapperId: string;
  toolName: string;
  specFormat: string;  // openapi | postman
  endpoints: ToolEndpoint[];
  generatedCode: string;
  generatedAt: string;
  specHash: string;
  metadata: Record<string, unknown>;
}

export interface WrapperGenerateRequest {
  specContent: string;
  specFormat?: string;  // openapi | postman
  toolName?: string;
  baseUrl?: string;
  defaultTimeout?: number;
  defaultRetries?: number;
  includeTypeHints?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WrapperGenerateResult {
  wrapper: GeneratedWrapper;
  warnings: string[];
  endpointCount: number;
  durationMs: number;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function safeName(raw: string): string {
  let name = raw.trim().toLowerCase();
  for (const ch of [' ', '-', '/', '.', '{', '}', ':', ',']) {
    name = name.split(ch).join('_');
  }
  while (name.length > 0 && /^\d/.test(name)) name = '_' + name;
  return name || 'endpoint';
}

function tsType(openApiType: string): string {
  const map: Record<string, string> = {
    string: 'string', integer: 'number', boolean: 'boolean',
    number: 'number', array: 'unknown[]', object: 'Record<string, unknown>',
  };
  return map[openApiType] ?? 'unknown';
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/* ── APIWrapperGenerator ───────────────────────────────────────────── */

export class APIWrapperGenerator {
  private history: GeneratedWrapper[] = [];

  generate(request: WrapperGenerateRequest): WrapperGenerateResult {
    const t0 = performance.now();
    const warnings: string[] = [];

    let spec: Record<string, unknown> = {};
    try {
      spec = JSON.parse(request.specContent) as Record<string, unknown>;
    } catch (err) {
      warnings.push(`Could not parse spec as JSON: ${err instanceof Error ? err.message : String(err)}`);
    }

    const specHash = hashContent(request.specContent);
    const fmt = (request.specFormat ?? 'openapi').toLowerCase();
    const timeout = request.defaultTimeout ?? 30;
    const maxRetries = request.defaultRetries ?? 3;

    let toolName = '';
    let endpoints: ToolEndpoint[] = [];
    let parseWarnings: string[] = [];

    if (fmt === 'openapi') {
      ({ toolName, endpoints, warnings: parseWarnings } = this.parseOpenAPI(spec, request.baseUrl ?? '', timeout, maxRetries));
    } else if (fmt === 'postman') {
      ({ toolName, endpoints, warnings: parseWarnings } = this.parsePostman(spec, request.baseUrl ?? '', timeout, maxRetries));
    } else {
      parseWarnings = [`Unknown spec_format: "${fmt}"`];
    }

    warnings.push(...parseWarnings);
    toolName = request.toolName || toolName || 'generated_tool';

    const code = this.generateTsCode(toolName, endpoints, request.includeTypeHints ?? true);
    const wrapperId = randomUUID();
    const ts = new Date().toISOString();

    const wrapper: GeneratedWrapper = {
      wrapperId, toolName, specFormat: fmt, endpoints,
      generatedCode: code, generatedAt: ts, specHash,
      metadata: request.metadata ?? {},
    };

    this.history.unshift(wrapper);
    if (this.history.length > 100) this.history.length = 100;

    const durationMs = Math.round(performance.now() - t0);
    return { wrapper, warnings, endpointCount: endpoints.length, durationMs };
  }

  getHistory(limit = 20): GeneratedWrapper[] {
    return this.history.slice(0, limit);
  }

  /* ── OpenAPI 3.x parser ─────────────────────────────────────────── */

  private parseOpenAPI(
    spec: Record<string, unknown>, baseUrl: string, timeout: number, maxRetries: number,
  ): { toolName: string; endpoints: ToolEndpoint[]; warnings: string[] } {
    const warnings: string[] = [];
    const endpoints: ToolEndpoint[] = [];

    const info = (spec.info as Record<string, unknown>) ?? {};
    const toolName = safeName(String(info.title ?? 'api_tool'));

    if (!baseUrl) {
      const servers = spec.servers as Array<Record<string, unknown>> | undefined;
      if (servers?.length) baseUrl = String(servers[0]?.url ?? '');
      else warnings.push('No servers array found in OpenAPI spec; baseUrl will be empty');
    }

    const paths = (spec.paths ?? {}) as Record<string, Record<string, unknown>>;
    for (const [path, pathItem] of Object.entries(paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
        const op = pathItem[method] as Record<string, unknown> | undefined;
        if (!op || typeof op !== 'object') continue;

        const opId = String(op.operationId ?? '');
        const name = safeName(opId || `${method}_${path}`);
        const description = String(op.summary ?? op.description ?? '');
        const tags = (op.tags as string[]) ?? [];

        const params: ParameterDef[] = [];
        for (const p of (op.parameters as Array<Record<string, unknown>>) ?? []) {
          const schema = (p.schema as Record<string, unknown>) ?? {};
          params.push({
            name: String(p.name ?? 'param'),
            type: String(schema.type ?? 'string'),
            required: Boolean(p.required),
            defaultValue: schema.default,
            description: String(p.description ?? ''),
            enumValues: ((schema.enum as unknown[]) ?? []).map(String),
            validationPattern: String(schema.pattern ?? ''),
          });
        }

        // Request body
        const reqBody = (op.requestBody as Record<string, unknown>) ?? {};
        const bodyContent = (reqBody.content as Record<string, Record<string, unknown>>) ?? {};
        for (const mimeVal of Object.values(bodyContent)) {
          const bodySchema = (mimeVal.schema as Record<string, unknown>) ?? {};
          const props = (bodySchema.properties as Record<string, Record<string, unknown>>) ?? {};
          const reqProps = (bodySchema.required as string[]) ?? [];
          for (const [propName, propSchema] of Object.entries(props)) {
            params.push({
              name: propName,
              type: String(propSchema.type ?? 'string'),
              required: reqProps.includes(propName),
              defaultValue: propSchema.default,
              description: String(propSchema.description ?? ''),
              enumValues: [],
              validationPattern: '',
            });
          }
          break; // only first content type
        }

        // Response schema
        const responses = (op.responses as Record<string, Record<string, unknown>>) ?? {};
        let responseSchema: Record<string, unknown> = {};
        for (const code of ['200', '201', 'default']) {
          if (responses[code]) {
            const rc = (responses[code]!.content as Record<string, Record<string, unknown>>) ?? {};
            for (const mv of Object.values(rc)) {
              responseSchema = (mv.schema as Record<string, unknown>) ?? {};
              break;
            }
            break;
          }
        }

        endpoints.push({
          endpointId: randomUUID(),
          name, description,
          method: method.toUpperCase(),
          path, baseUrl,
          parameters: params,
          headers: {},
          responseSchema,
          tags,
          retryConfig: { maxRetries, backoffFactor: 2, retryOn: [429, 500, 502, 503] },
          timeoutSeconds: timeout,
        });
      }
    }

    return { toolName, endpoints, warnings };
  }

  /* ── Postman Collection v2.1 parser ─────────────────────────────── */

  private parsePostman(
    spec: Record<string, unknown>, baseUrl: string, timeout: number, maxRetries: number,
  ): { toolName: string; endpoints: ToolEndpoint[]; warnings: string[] } {
    const warnings: string[] = [];
    const endpoints: ToolEndpoint[] = [];
    const info = (spec.info as Record<string, unknown>) ?? {};
    const toolName = safeName(String(info.name ?? 'postman_tool'));

    const collectItems = (items: unknown[]): void => {
      for (const item of items as Array<Record<string, unknown>>) {
        if (Array.isArray(item.item)) {
          collectItems(item.item);
        } else if (item.request) {
          const req = item.request as Record<string, unknown>;
          const method = String(req.method ?? 'GET').toUpperCase();
          const urlObj = req.url;
          let path = '';
          let resolvedBase = baseUrl;

          if (typeof urlObj === 'string') {
            path = urlObj;
          } else if (urlObj && typeof urlObj === 'object') {
            const uo = urlObj as Record<string, unknown>;
            const pathParts = (uo.path as string[]) ?? [];
            path = '/' + pathParts.join('/');
            const host = (uo.host as string[]) ?? [];
            const protocol = String(uo.protocol ?? 'https');
            if (!resolvedBase && host.length) resolvedBase = `${protocol}://${host.join('.')}`;
          }

          const name = safeName(String(item.name ?? `${method}_${path}`));
          const description = typeof req.description === 'string' ? req.description :
            (typeof req.description === 'object' && req.description ? String((req.description as Record<string, unknown>).content ?? '') : '');

          const params: ParameterDef[] = [];
          if (urlObj && typeof urlObj === 'object') {
            for (const qp of ((urlObj as Record<string, unknown>).query as Array<Record<string, unknown>>) ?? []) {
              params.push({
                name: String(qp.key ?? 'param'), type: 'string', required: false,
                defaultValue: qp.value, description: String(qp.description ?? ''),
                enumValues: [], validationPattern: '',
              });
            }
          }

          const headers: Record<string, string> = {};
          for (const h of (req.header as Array<Record<string, string>>) ?? []) {
            headers[h.key ?? ''] = h.value ?? '';
          }

          endpoints.push({
            endpointId: randomUUID(), name, description, method, path,
            baseUrl: resolvedBase, parameters: params, headers,
            responseSchema: {}, tags: [],
            retryConfig: { maxRetries, backoffFactor: 2, retryOn: [429, 500, 502, 503] },
            timeoutSeconds: timeout,
          });
        }
      }
    };

    collectItems((spec.item as unknown[]) ?? []);
    return { toolName, endpoints, warnings };
  }

  /* ── TypeScript code generator ──────────────────────────────────── */

  private generateTsCode(toolName: string, endpoints: ToolEndpoint[], includeTypes: boolean): string {
    const className = toolName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const lines: string[] = [
      `/** Auto-generated API wrapper. Tool: ${toolName} */`,
      '',
      `export class ${className} {`,
      '  constructor(private baseUrl = "", private headers: Record<string, string> = {}) {}',
      '',
    ];

    for (const ep of endpoints) {
      const reqParams = ep.parameters.filter(p => p.required);
      const optParams = ep.parameters.filter(p => !p.required);
      const sigParts = reqParams.map(p => includeTypes ? `${p.name}: ${tsType(p.type)}` : p.name);
      sigParts.push(...optParams.map(p => includeTypes ? `${p.name}?: ${tsType(p.type)}` : `${p.name}?`));

      const ret = includeTypes ? ': Promise<Record<string, unknown>>' : '';
      lines.push(`  async ${ep.name}(${sigParts.join(', ')})${ret} {`);
      lines.push(`    const url = (this.baseUrl || ${JSON.stringify(ep.baseUrl)}) + ${JSON.stringify(ep.path)};`);
      lines.push(`    const resp = await fetch(url, { method: ${JSON.stringify(ep.method)}, headers: { 'Content-Type': 'application/json', ...this.headers } });`);
      lines.push(`    return resp.json() as Promise<Record<string, unknown>>;`);
      lines.push('  }');
      lines.push('');
    }

    lines.push('}');
    return lines.join('\n');
  }
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _generator: APIWrapperGenerator | undefined;

export function getApiWrapperGenerator(): APIWrapperGenerator {
  if (!_generator) _generator = new APIWrapperGenerator();
  return _generator;
}
