import { io } from "./deps.ts";

import assert from "./assert.ts";
import isType from "./isType.ts";

export default function assertType<T>(
  value: unknown,
  Type: io.Type<T>,
): asserts value is T {
  assert(isType(value, Type));
}
