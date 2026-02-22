export type AMCSDKErrorCode =
  | "INVALID_BRIDGE_URL"
  | "SELF_SCORING_BLOCKED"
  | "NETWORK_ERROR"
  | "HTTP_ERROR"
  | "INVALID_JSON";

export interface AMCSDKErrorOptions {
  code: AMCSDKErrorCode;
  message: string;
  status?: number;
  path?: string;
  details?: string;
  cause?: unknown;
}

/**
 * Stable SDK error type for all developer-facing failures.
 */
export class AMCSDKError extends Error {
  readonly code: AMCSDKErrorCode;
  readonly status?: number;
  readonly path?: string;
  readonly details?: string;

  constructor(options: AMCSDKErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AMCSDKError";
    this.code = options.code;
    this.status = options.status;
    this.path = options.path;
    this.details = options.details;
  }
}

export function trimForError(value: string, limit = 300): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= limit) {
    return collapsed;
  }
  return `${collapsed.slice(0, limit)}...`;
}
