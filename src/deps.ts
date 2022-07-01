export { serve } from "https://deno.land/std@0.146.0/http/mod.ts";

import {
  pack as untypedPack,
  unpack as untypedUnpack,
} from "https://deno.land/x/msgpackr@v1.6.0/index.js";

export const pack = untypedPack as (value: unknown) => Uint8Array;
export const unpack = untypedUnpack as (packed: Uint8Array) => unknown;

export * as io from "https://esm.sh/io-ts";
