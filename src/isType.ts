import { io } from "./deps.ts";

export default function isType<T>(
  value: unknown,
  Type: io.Type<T>,
): value is T {
  const decodeResult = Type.decode(value);
  return "right" in decodeResult;
}
