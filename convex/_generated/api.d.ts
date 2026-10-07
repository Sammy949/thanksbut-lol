/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as archives from "../archives.js";
import type * as cleanupJobs from "../cleanupJobs.js";
import type * as crons from "../crons.js";
import type * as lib_identity from "../lib/identity.js";
import type * as lib_serialize from "../lib/serialize.js";
import type * as reactions from "../reactions.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as uploadCleanup from "../uploadCleanup.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  archives: typeof archives;
  cleanupJobs: typeof cleanupJobs;
  crons: typeof crons;
  "lib/identity": typeof lib_identity;
  "lib/serialize": typeof lib_serialize;
  reactions: typeof reactions;
  reports: typeof reports;
  seed: typeof seed;
  uploadCleanup: typeof uploadCleanup;
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
