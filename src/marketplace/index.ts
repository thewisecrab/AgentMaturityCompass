/**
 * marketplace/index.ts — Public API surface for the AMC Pack Marketplace.
 */

export { buildCatalog, searchCatalog, resolvePack } from "./marketplaceIndex.js";
export {
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
} from "./marketplaceStore.js";
export {
  packSearchCli,
  packInfoCli,
  packInstallCli,
  packUninstallCli,
  packRateCli,
  packListCli,
  packFeaturedCli,
  packSetFeaturedCli,
  packDeprecateCli,
  packUndeprecateCli
} from "./marketplaceCli.js";
export { handleMarketplaceRoute } from "./marketplaceRouter.js";
export type {
  MarketplaceCatalogEntry,
  MarketplaceSearchParams,
  MarketplaceStore,
  PackCategory,
  PackSource,
  PackRating,
  PackRatingStats,
  MarketplaceInstallRecord
} from "./marketplaceTypes.js";
