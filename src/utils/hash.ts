import { createHash } from "node:crypto";

export function sha256Hex(input: Buffer | string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function sha256FileHex(fileBuffer: Buffer): string {
  return sha256Hex(fileBuffer);
}
