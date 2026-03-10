import { describe, it, expect } from "vitest";
import { inferFormat } from "../src/eval/evalRunCli.js";

describe("eval run CLI", () => {
  describe("inferFormat", () => {
    it("defaults to terminal when no output and no explicit format", () => {
      expect(inferFormat(undefined, undefined)).toBe("terminal");
    });

    it("uses explicit format when provided", () => {
      expect(inferFormat(undefined, "json")).toBe("json");
      expect(inferFormat(undefined, "html")).toBe("html");
      expect(inferFormat("report.json", "html")).toBe("html"); // explicit wins
    });

    it("infers json from .json extension", () => {
      expect(inferFormat("report.json")).toBe("json");
    });

    it("infers html from .html extension", () => {
      expect(inferFormat("report.html")).toBe("html");
      expect(inferFormat("report.htm")).toBe("html");
    });

    it("falls back to terminal for unknown extensions", () => {
      expect(inferFormat("report.md")).toBe("terminal");
      expect(inferFormat("report.txt")).toBe("terminal");
    });
  });
});
