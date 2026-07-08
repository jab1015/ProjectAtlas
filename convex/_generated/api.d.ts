/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as categories from "../categories.js";
import type * as faqEntries from "../faqEntries.js";
import type * as files from "../files.js";
import type * as filesInternal from "../filesInternal.js";
import type * as http from "../http.js";
import type * as journeyEngine from "../journeyEngine.js";
import type * as mockValidationResearchProvider from "../mockValidationResearchProvider.js";
import type * as openaiValidationResearchProvider from "../openaiValidationResearchProvider.js";
import type * as productFiles from "../productFiles.js";
import type * as products from "../products.js";
import type * as productsAdmin from "../productsAdmin.js";
import type * as productsInternal from "../productsInternal.js";
import type * as productsMutations from "../productsMutations.js";
import type * as purchases from "../purchases.js";
import type * as purchasesInternal from "../purchasesInternal.js";
import type * as purchasesMutations from "../purchasesMutations.js";
import type * as seed from "../seed.js";
import type * as testimonials from "../testimonials.js";
import type * as users from "../users.js";
import type * as usersMutations from "../usersMutations.js";
import type * as validation_researchProvider from "../validation/researchProvider.js";
import type * as validationActions from "../validationActions.js";
import type * as validationMutations from "../validationMutations.js";
import type * as validationResearchMutations from "../validationResearchMutations.js";
import type * as validationResearchOrchestration from "../validationResearchOrchestration.js";
import type * as validationResearchOrchestrationRunner from "../validationResearchOrchestrationRunner.js";
import type * as validationResearchProvider from "../validationResearchProvider.js";
import type * as validationResearchSessionMutations from "../validationResearchSessionMutations.js";
import type * as validationResearchTypes from "../validationResearchTypes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  categories: typeof categories;
  faqEntries: typeof faqEntries;
  files: typeof files;
  filesInternal: typeof filesInternal;
  http: typeof http;
  journeyEngine: typeof journeyEngine;
  mockValidationResearchProvider: typeof mockValidationResearchProvider;
  openaiValidationResearchProvider: typeof openaiValidationResearchProvider;
  productFiles: typeof productFiles;
  products: typeof products;
  productsAdmin: typeof productsAdmin;
  productsInternal: typeof productsInternal;
  productsMutations: typeof productsMutations;
  purchases: typeof purchases;
  purchasesInternal: typeof purchasesInternal;
  purchasesMutations: typeof purchasesMutations;
  seed: typeof seed;
  testimonials: typeof testimonials;
  users: typeof users;
  usersMutations: typeof usersMutations;
  "validation/researchProvider": typeof validation_researchProvider;
  validationActions: typeof validationActions;
  validationMutations: typeof validationMutations;
  validationResearchMutations: typeof validationResearchMutations;
  validationResearchOrchestration: typeof validationResearchOrchestration;
  validationResearchOrchestrationRunner: typeof validationResearchOrchestrationRunner;
  validationResearchProvider: typeof validationResearchProvider;
  validationResearchSessionMutations: typeof validationResearchSessionMutations;
  validationResearchTypes: typeof validationResearchTypes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
