const state = {
  adminToken: null,
  me: null
};

export function setAdminToken(token) {
  state.adminToken = token && token.length > 0 ? token : null;
}

export function getAdminToken() {
  return state.adminToken;
}

export function getCurrentUser() {
  return state.me;
}

function buildHeaders(extraHeaders) {
  const headers = { ...(extraHeaders || {}) };
  if (state.adminToken) {
    headers["x-amc-admin-token"] = state.adminToken;
  }
  return headers;
}

function runtimeBasePrefix() {
  const path = window.location.pathname || "/";
  if (path.startsWith("/w/")) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `/${parts[0]}/${parts[1]}`;
    }
  }
  if (path.startsWith("/host/")) {
    return "/host";
  }
  return "";
}

function withBase(path) {
  if (!path || typeof path !== "string") {
    return path;
  }
  if (/^https?:\/\//i.test(path) || path.startsWith("//")) {
    return path;
  }
  if (path.startsWith("/w/") || path.startsWith("/host/")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = runtimeBasePrefix();
  return `${prefix}${normalized}`;
}

async function request(path, options) {
  const response = await fetch(withBase(path), {
    method: options?.method || "GET",
    credentials: "include",
    headers: buildHeaders(options?.headers),
    body: options?.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  if (!response.ok) {
    if (options?.allowAuthErrors && (response.status === 401 || response.status === 403)) {
      return {
        ok: false,
        status: response.status,
        data: parsed,
        error: parsed.error || `HTTP ${response.status}`
      };
    }
    throw new Error(parsed.error || `HTTP ${response.status}`);
  }
  return {
    ok: true,
    status: response.status,
    data: parsed
  };
}

export async function login(params) {
  if (params?.pairingCode) {
    await request("/pair/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { code: params.pairingCode }
    });
  }
  await request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: {
      username: params.username,
      password: params.password
    }
  });
  return whoami();
}

export async function logout() {
  await request("/auth/logout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: {}
  });
  state.me = null;
}

export async function whoami() {
  const result = await request("/auth/me", {
    allowAuthErrors: true
  });
  if (!result.ok) {
    state.me = null;
    return null;
  }
  state.me = result.data;
  return state.me;
}

export async function apiGet(path) {
  const result = await request(path);
  return result.data;
}

export async function apiPost(path, body) {
  const result = await request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body || {}
  });
  return result.data;
}
