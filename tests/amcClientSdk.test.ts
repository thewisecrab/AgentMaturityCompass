import { describe, expect, test } from "vitest";
import { AMCClient, createAMCClientFromEnv } from "../src/sdk/amcClient.js";

describe("AMCClient SDK ergonomics", () => {
  test("uses environment defaults when config is omitted", () => {
    const prevUrl = process.env.AMC_BRIDGE_URL;
    const prevToken = process.env.AMC_TOKEN;
    process.env.AMC_BRIDGE_URL = "http://env-bridge:7777";
    process.env.AMC_TOKEN = "env-token";

    try {
      const client = new AMCClient({});
      expect(client.bridgeUrl).toBe("http://env-bridge:7777");
      expect(client.token).toBe("env-token");
    } finally {
      process.env.AMC_BRIDGE_URL = prevUrl;
      process.env.AMC_TOKEN = prevToken;
    }
  });

  test("createAMCClientFromEnv builds a usable client", () => {
    const prevUrl = process.env.AMC_BRIDGE_URL;
    process.env.AMC_BRIDGE_URL = "http://localhost:3212/";

    try {
      const client = createAMCClientFromEnv();
      expect(client.bridgeUrl).toBe("http://localhost:3212");
    } finally {
      process.env.AMC_BRIDGE_URL = prevUrl;
    }
  });
});
