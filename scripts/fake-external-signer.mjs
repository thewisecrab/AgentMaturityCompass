#!/usr/bin/env node

import { createPrivateKey, createPublicKey, generateKeyPairSync, sign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  fake-external-signer.mjs keygen --private <path> [--public <path>]",
      "  fake-external-signer.mjs sign --kind <kind> --payload-sha256 <hex> --payload-b64 <base64> --out <json>"
    ].join("\n") + "\n"
  );
}

function getArg(name, args) {
  const idx = args.indexOf(name);
  if (idx < 0 || idx + 1 >= args.length) {
    return null;
  }
  return args[idx + 1];
}

function ensureParent(filePath) {
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

function rawPublicFromSpkiDer(der) {
  if (der.length < 32) {
    throw new Error("invalid SPKI DER length");
  }
  return der.subarray(der.length - 32);
}

async function run() {
  const [, , command, ...args] = process.argv;
  if (!command) {
    usage();
    process.exit(2);
  }

  if (command === "keygen") {
    const privateOut = getArg("--private", args);
    const publicOut = getArg("--public", args);
    if (!privateOut) {
      throw new Error("missing --private for keygen");
    }
    const keyPair = generateKeyPairSync("ed25519");
    const privatePem = keyPair.privateKey.export({ type: "pkcs8", format: "pem" }).toString("utf8");
    const publicPem = keyPair.publicKey.export({ type: "spki", format: "pem" }).toString("utf8");
    ensureParent(privateOut);
    writeFileSync(resolve(privateOut), privatePem, { mode: 0o600 });
    if (publicOut) {
      ensureParent(publicOut);
      writeFileSync(resolve(publicOut), publicPem, { mode: 0o644 });
    }
    process.stdout.write("ok\n");
    return;
  }

  if (command !== "sign") {
    usage();
    process.exit(2);
  }

  const kind = getArg("--kind", args) ?? "UNKNOWN";
  const payloadSha256 = getArg("--payload-sha256", args);
  const payloadB64 = getArg("--payload-b64", args);
  const outFile = getArg("--out", args);
  if (!payloadSha256 || !payloadB64 || !outFile) {
    throw new Error("missing required sign args: --payload-sha256 --payload-b64 --out");
  }

  const keyPath = process.env.AMC_FAKE_SIGNER_PRIVATE_KEY_FILE;
  if (!keyPath) {
    throw new Error("AMC_FAKE_SIGNER_PRIVATE_KEY_FILE is required");
  }
  const privatePem = readFileSync(resolve(keyPath), "utf8");
  const privateKey = createPrivateKey(privatePem);
  const publicKey = createPublicKey(privateKey);
  const publicDer = publicKey.export({ type: "spki", format: "der" });
  const rawPublic = rawPublicFromSpkiDer(Buffer.from(publicDer));
  const fingerprint = (await import("node:crypto")).createHash("sha256").update(rawPublic).digest("hex");

  const payload = Buffer.from(payloadB64, "base64");
  const actualPayloadSha = (await import("node:crypto")).createHash("sha256").update(payload).digest("hex");
  if (payloadSha256 !== actualPayloadSha) {
    throw new Error("payload sha mismatch");
  }

  const sigB64 = sign(null, payload, privateKey).toString("base64");
  const out = {
    v: 1,
    alg: "ed25519",
    pubkeyB64: rawPublic.toString("base64"),
    signatureB64: sigB64,
    keyFingerprint: fingerprint,
    claims: {
      hardware: true,
      device: "HSM",
      vendor: "AMC",
      model: "fake-external-signer",
      serialRedacted: "simulated",
      kind
    }
  };
  ensureParent(outFile);
  writeFileSync(resolve(outFile), JSON.stringify(out), { mode: 0o600 });
}

run().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
