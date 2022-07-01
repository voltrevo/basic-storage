import { io } from "./deps.ts";

const ioBuffer = new io.Type<Uint8Array, Uint8Array, unknown>(
  "buffer",
  (input): input is Uint8Array => input instanceof Uint8Array,
  (input, context) =>
    input instanceof Uint8Array
      ? io.success(input)
      : io.failure(input, context),
  io.identity,
);

export default ioBuffer;
