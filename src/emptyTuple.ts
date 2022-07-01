import { io } from './deps.ts';

const isEmptyTuple = (input: unknown): input is [] =>
  Array.isArray(input) && input.length < 1;

/**
 * io-ts doesn't allow io.tuple([]). I'm not sure why - there's an open issue
 * about this: https://github.com/gcanti/io-ts/issues/633.
 */
const emptyTuple = new io.Type<[], [], unknown>(
  '[]',
  isEmptyTuple,
  (input, context) =>
    isEmptyTuple(input) ? io.success(input) : io.failure(input, context),
  io.identity,
);

export default emptyTuple;