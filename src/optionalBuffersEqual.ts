import nil from "./nil.ts";
import buffersEqual from "./buffersEqual.ts";

export default function optionalBuffersEqual(
  a: Uint8Array | nil,
  b: Uint8Array | nil,
): boolean {
  if (a === nil) {
    return b === nil;
  }

  if (b === nil) {
    return false;
  }

  return buffersEqual(a, b);
}
