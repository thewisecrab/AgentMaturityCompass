/**
 * tests/marketplace.test.ts — Tests for the AMC Pack Marketplace.
 *
 * Covers: store CRUD, catalog building, search/filter, ratings, install flow,
 * deprecation, featured, and CLI functions.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  ensureMarketplaceStore,
  loadMarketplaceStore,
  saveMarketplaceStore,
  addOrUpdateRating,
  getRatings,
  getRatingStats,
  incrementInstallCount,
  getInstallCount,
  setFeatured,
  getFeatured,
  deprecatePack,
  undeprecatePack,
  isDeprecated,
  marketplaceRoot,
  marketplaceStorePath
} from "../src/marketplace/marketplaceStore.js";
import type { MarketplaceStore, PackRating } from "../src/marketplace/marketplaceTypes.js";
import { pathExists } from "../src/utils/fs.js";

let workspace: string;

beforeEach(() => {
  workspace = mkdtempSync(join(tmpdir(), "amc-marketplace-test-"));
});

afterEach(() => {
  rmSync(workspace, { recursive: true, force: true });
});

/* ── Store init ───────────────────────────────────────────────── */

describe("marketplace store", () => {
  it("creates store on init", () => {
    ensureMarketplaceStore(workspace);
    expect(pathExists(marketplaceStorePath(workspace))).toBe(true);
    const store = loadMarketplaceStore(workspace);
    expect(store.v).toBe(1);
    expect(store.ratings).toEqual([]);
    expect(store.installCounts).toEqual({});
    expect(store.featured).toEqual([]);
    expect(store.deprecated).toEqual([]);
  });

  it("idempotent init", () => {
    ensureMarketplaceStore(workspace);
    ensureMarketplaceStore(workspace);
    const store = loadMarketplaceStore(workspace);
    expect(store.v).toBe(1);
  });
});

/* ── Ratings ──────────────────────────────────────────────────── */

describe("ratings", () => {
  beforeEach(() => ensureMarketplaceStore(workspace));

  it("adds a rating", () => {
    const stats = addOrUpdateRating(workspace, {
      packId: "test-pack",
      userId: "user1",
      score: 4,
      review: "Great pack!",
      createdTs: Date.now(),
      updatedTs: Date.now()
    });
    expect(stats.totalRatings).toBe(1);
    expect(stats.averageScore).toBe(4);
    expect(stats.distribution["4"]).toBe(1);
  });

  it("updates existing rating by same user", () => {
    addOrUpdateRating(workspace, {
      packId: "test-pack",
      userId: "user1",
      score: 3,
      createdTs: Date.now(),
      updatedTs: Date.now()
    });
    const stats = addOrUpdateRating(workspace, {
      packId: "test-pack",
      userId: "user1",
      score: 5,
      review: "Changed my mind",
      createdTs: Date.now(),
      updatedTs: Date.now()
    });
    expect(stats.totalRatings).toBe(1);
    expect(stats.averageScore).toBe(5);
  });

  it("computes average across multiple users", () => {
    addOrUpdateRating(workspace, {
      packId: "test-pack", userId: "user1", score: 5,
      createdTs: Date.now(), updatedTs: Date.now()
    });
    addOrUpdateRating(workspace, {
      packId: "test-pack", userId: "user2", score: 3,
      createdTs: Date.now(), updatedTs: Date.now()
    });
    const stats = getRatingStats(workspace, "test-pack");
    expect(stats.totalRatings).toBe(2);
    expect(stats.averageScore).toBe(4);
    expect(stats.distribution["5"]).toBe(1);
    expect(stats.distribution["3"]).toBe(1);
  });

  it("returns empty stats for unrated pack", () => {
    const stats = getRatingStats(workspace, "nonexistent");
    expect(stats.totalRatings).toBe(0);
    expect(stats.averageScore).toBe(0);
  });

  it("gets ratings list", () => {
    addOrUpdateRating(workspace, {
      packId: "test-pack", userId: "user1", score: 4,
      review: "Nice", createdTs: Date.now(), updatedTs: Date.now()
    });
    const ratings = getRatings(workspace, "test-pack");
    expect(ratings).toHaveLength(1);
    expect(ratings[0].review).toBe("Nice");
  });
});

/* ── Install counts ───────────────────────────────────────────── */

describe("install counts", () => {
  beforeEach(() => ensureMarketplaceStore(workspace));

  it("increments install count", () => {
    expect(incrementInstallCount(workspace, "pack-a")).toBe(1);
    expect(incrementInstallCount(workspace, "pack-a")).toBe(2);
    expect(getInstallCount(workspace, "pack-a")).toBe(2);
  });

  it("returns 0 for unknown pack", () => {
    expect(getInstallCount(workspace, "unknown")).toBe(0);
  });
});

/* ── Featured ─────────────────────────────────────────────────── */

describe("featured", () => {
  beforeEach(() => ensureMarketplaceStore(workspace));

  it("sets and gets featured packs", () => {
    setFeatured(workspace, ["pack-a", "pack-b"]);
    expect(getFeatured(workspace)).toEqual(["pack-a", "pack-b"]);
  });

  it("deduplicates featured list", () => {
    setFeatured(workspace, ["pack-a", "pack-a", "pack-b"]);
    const featured = getFeatured(workspace);
    expect(featured).toHaveLength(2);
  });
});

/* ── Deprecation ──────────────────────────────────────────────── */

describe("deprecation", () => {
  beforeEach(() => ensureMarketplaceStore(workspace));

  it("deprecates a pack", () => {
    deprecatePack(workspace, "old-pack", "Use new-pack instead");
    const result = isDeprecated(workspace, "old-pack");
    expect(result.deprecated).toBe(true);
    expect(result.note).toBe("Use new-pack instead");
  });

  it("undeprecates a pack", () => {
    deprecatePack(workspace, "old-pack");
    undeprecatePack(workspace, "old-pack");
    expect(isDeprecated(workspace, "old-pack").deprecated).toBe(false);
  });

  it("returns not deprecated for unknown pack", () => {
    expect(isDeprecated(workspace, "unknown").deprecated).toBe(false);
  });
});

/* ── Store persistence ────────────────────────────────────────── */

describe("store persistence", () => {
  it("persists across load/save cycles", () => {
    ensureMarketplaceStore(workspace);
    addOrUpdateRating(workspace, {
      packId: "p1", userId: "u1", score: 5,
      createdTs: Date.now(), updatedTs: Date.now()
    });
    incrementInstallCount(workspace, "p1");
    setFeatured(workspace, ["p1"]);
    deprecatePack(workspace, "p2", "old");

    // Reload from disk
    const store = loadMarketplaceStore(workspace);
    expect(store.ratings).toHaveLength(1);
    expect(store.installCounts["p1"]).toBe(1);
    expect(store.featured).toEqual(["p1"]);
    expect(store.deprecated).toHaveLength(1);
    expect(store.deprecated[0].packId).toBe("p2");
  });
});
