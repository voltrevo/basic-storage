export default function assert(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error("assertion failed");
  }
}
