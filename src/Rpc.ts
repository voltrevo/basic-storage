import { io } from "./deps.ts";

import emptyTuple from "./emptyTuple.ts";
import ExplicitAny from "./ExplicitAny.ts";
import ioBuffer from "./ioBuffer.ts";

export const rpcMap = {
  ping: {
    Params: emptyTuple,
    Response: io.literal("pong"),
  },
  read: {
    Params: io.tuple([
      ioBuffer,
      io.union([
        io.undefined,
        io.type({
          id: io.string,
          value: io.union([io.undefined, ioBuffer]),
        }),
      ]),
    ]),
    Response: io.union([
      io.undefined,
      ioBuffer,
      io.literal("please-retry"),
      io.literal("cancelled"),
    ]),
  },
  write: {
    Params: io.tuple([
      ioBuffer,
      io.union([io.undefined, ioBuffer]),
    ]),
    Response: io.void,
  },
  cancel: {
    Params: io.tuple([io.string]),
    Response: io.void,
  },
};

export type RpcMap = typeof rpcMap;

export const RequestMethodName: io.Type<keyof RpcMap> = io.union(
  Object.keys(rpcMap).map((k) => io.literal(k)) as ExplicitAny,
);

export type RequestMethodName = keyof RpcMap;

export const Request = io.type({
  id: io.string,
  method: RequestMethodName,
  params: io.array(io.unknown),
});

export type RpcImpl = {
  [M in RequestMethodName]: (
    ...params: io.TypeOf<RpcMap[M]["Params"]>
  ) => Promise<io.TypeOf<RpcMap[M]["Response"]>>;
};

export const Response = io.type({
  id: io.string,
  result: io.union([
    io.type({
      ok: io.unknown,
    }),
    io.type({
      error: io.type({
        message: io.string,
      }),
    }),
  ]),
});
