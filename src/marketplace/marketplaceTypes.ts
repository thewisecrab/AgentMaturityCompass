/**
 * marketplace/marketplaceTypes.ts — Type definitions for the AMC Pack Marketplace.
 *
 * Covers catalog entries, ratings, reviews, search, and install metadata.
 */

import { z } from "zod";
import { pluginArtifactKindSchema, pluginRiskCategorySchema } from "../plugins/pluginTypes.js";

/* ── Pack source ──────────────────────────────────────────────── */

export const packSourceSchema = z.enum(["builtin", "registry", "community"]);
export type PackSource = z.infer<typeof packSourceSchema>;

/* ── Pack category (marketplace-level) ────────────────────────── */

export const packCategorySchema = z.enum([
  "assurance",
  "red-team",
  "policy",
  "compliance",
  "adapter",
  "transform",
  "casebook",
  "learn",
  "outcome",
  "other"
]);
export type PackCategory = z.infer<typeof packCategorySchema>;

/* ── Rating ───────────────────────────────────────────────────── */

export const packRatingSchema = z.object({
  packId: z.string().min(1),
  userId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
  createdTs: z.number().int(),
  updatedTs: z.number().int()
});
export type PackRating = z.infer<typeof packRatingSchema>;

/* ── Aggregated rating stats ──────────────────────────────────── */

export const packRatingStatsSchema = z.object({
  packId: z.string().min(1),
  totalRatings: z.number().int().nonnegative(),
  averageScore: z.number().min(0).max(5),
  distribution: z.object({
    "1": z.number().int().nonnegative(),
    "2": z.number().int().nonnegative(),
    "3": z.number().int().nonnegative(),
    "4": z.number().int().nonnegative(),
    "5": z.number().int().nonnegative()
  })
});
export type PackRatingStats = z.infer<typeof packRatingStatsSchema>;

/* ── Catalog entry (unified marketplace listing) ──────────────── */

export const marketplaceCatalogEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  category: packCategorySchema,
  source: packSourceSchema,
  riskCategory: pluginRiskCategorySchema.optional(),
  publisher: z.object({
    org: z.string().min(1),
    contact: z.string().optional(),
    website: z.string().optional(),
    fingerprint: z.string().optional()
  }),
  tags: z.array(z.string()).default([]),
  compatibility: z.object({
    amcMinVersion: z.string().optional(),
    nodeMinVersion: z.string().optional()
  }).optional(),
  artifactKinds: z.array(pluginArtifactKindSchema).default([]),
  registryId: z.string().optional(),
  sha256: z.string().length(64).optional(),
  installed: z.boolean().default(false),
  installedVersion: z.string().optional(),
  rating: packRatingStatsSchema.optional(),
  featured: z.boolean().default(false),
  deprecated: z.boolean().default(false),
  deprecationNote: z.string().optional(),
  createdTs: z.number().int(),
  updatedTs: z.number().int()
});
export type MarketplaceCatalogEntry = z.infer<typeof marketplaceCatalogEntrySchema>;

/* ── Search/filter params ─────────────────────────────────────── */

export const marketplaceSearchParamsSchema = z.object({
  query: z.string().optional(),
  category: packCategorySchema.optional(),
  source: packSourceSchema.optional(),
  riskCategory: pluginRiskCategorySchema.optional(),
  installed: z.boolean().optional(),
  featured: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(["name", "rating", "updated", "downloads"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().nonnegative().default(0)
});
export type MarketplaceSearchParams = z.infer<typeof marketplaceSearchParamsSchema>;

/* ── Install record ───────────────────────────────────────────── */

export const marketplaceInstallRecordSchema = z.object({
  packId: z.string().min(1),
  version: z.string().min(1),
  source: packSourceSchema,
  registryId: z.string().optional(),
  sha256: z.string().length(64).optional(),
  installedTs: z.number().int(),
  installedBy: z.string().min(1)
});
export type MarketplaceInstallRecord = z.infer<typeof marketplaceInstallRecordSchema>;

/* ── Marketplace store schema (persisted JSON) ────────────────── */

export const marketplaceStoreSchema = z.object({
  v: z.literal(1),
  updatedTs: z.number().int(),
  ratings: z.array(packRatingSchema),
  installCounts: z.record(z.string(), z.number().int().nonnegative()),
  featured: z.array(z.string()),
  deprecated: z.array(z.object({
    packId: z.string().min(1),
    note: z.string().optional(),
    since: z.number().int()
  }))
});
export type MarketplaceStore = z.infer<typeof marketplaceStoreSchema>;
