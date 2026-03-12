import { describe, expect, it } from "vitest";
import { Command } from "commander";
import {
  cliDiscoverabilityFooter,
  flattenCommandPaths,
  parseUnknownCommandToken,
  suggestCommandPaths
} from "../src/cliUx.js";

describe("cliUx", () => {
  it("flattens nested command paths", () => {
    const program = new Command();
    const adapters = program.command("adapters");
    adapters.command("run");
    adapters.command("list");
    program.command("run");

    expect(flattenCommandPaths(program)).toEqual(["adapters", "adapters run", "adapters list", "run"]);
  });

  it("suggests close command paths", () => {
    const suggestions = suggestCommandPaths("adaptes run", ["run", "adapters run", "adapters list", "verify all"]);
    expect(suggestions[0]).toBe("adapters run");

    const typoSuggestions = suggestCommandPaths("rn", ["run", "loop run", "governor", "verify all"]);
    expect(typoSuggestions[0]).toBe("run");
  });

  it("extracts unknown command token from commander error text", () => {
    expect(parseUnknownCommandToken("error: unknown command 'rn'"))
      .toBe("rn");
    expect(parseUnknownCommandToken("some other error"))
      .toBeNull();
  });

  it("includes practical discoverability tips", () => {
    const footer = cliDiscoverabilityFooter();
    expect(footer).toContain("amc help <command>");
    expect(footer).toContain("amc quickstart");
    expect(footer).toContain("amc doctor");
    expect(footer).toContain("amc score");
    expect(footer).toContain("amc shell");
  });
});
