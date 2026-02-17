import { createReadStream } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { getAgentPaths, resolveAgentId } from "../fleet/paths.js";
import { pathExists } from "../utils/fs.js";

export interface ServeDashboardInput {
  workspace: string;
  agentId?: string;
  port: number;
  outDir?: string;
}

export interface DashboardServerHandle {
  agentId: string;
  rootDir: string;
  url: string;
  close: () => Promise<void>;
}

function contentType(file: string): string {
  const ext = extname(file).toLowerCase();
  if (ext === ".html") {
    return "text/html; charset=utf-8";
  }
  if (ext === ".js") {
    return "text/javascript; charset=utf-8";
  }
  if (ext === ".css") {
    return "text/css; charset=utf-8";
  }
  if (ext === ".json") {
    return "application/json; charset=utf-8";
  }
  if (ext === ".svg") {
    return "image/svg+xml";
  }
  return "application/octet-stream";
}

function safeResolve(root: string, pathname: string): string {
  const normalized = normalize(pathname).replace(/^\/+/, "");
  const file = normalized.length > 0 ? normalized : "index.html";
  const full = resolve(root, file);
  if (!full.startsWith(resolve(root))) {
    return resolve(root, "index.html");
  }
  return full;
}

export async function serveDashboard(input: ServeDashboardInput): Promise<DashboardServerHandle> {
  const agentId = resolveAgentId(input.workspace, input.agentId);
  const paths = getAgentPaths(input.workspace, agentId);
  const rootDir = input.outDir ? resolve(input.workspace, input.outDir) : join(paths.rootDir, "dashboard");

  if (!pathExists(join(rootDir, "index.html"))) {
    throw new Error(`Dashboard not built at ${rootDir}. Run 'amc dashboard build' first.`);
  }

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let file = safeResolve(rootDir, url.pathname === "/" ? "index.html" : url.pathname);
    if (!pathExists(file) && !extname(file)) {
      file = `${file}.html`;
    }
    if (!pathExists(file)) {
      res.statusCode = 404;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Not found");
      return;
    }
    res.statusCode = 200;
    res.setHeader("content-type", contentType(file));
    createReadStream(file).pipe(res);
  });

  await new Promise<void>((resolvePromise, rejectPromise) => {
    server.once("error", rejectPromise);
    server.listen(input.port, "127.0.0.1", () => resolvePromise());
  });

  return {
    agentId,
    rootDir,
    url: `http://127.0.0.1:${input.port}`,
    close: () =>
      new Promise((resolvePromise) => {
        server.close(() => resolvePromise());
      })
  };
}
