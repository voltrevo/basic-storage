import { io } from "./deps.ts";

import emptyTuple from "./emptyTuple.ts";
import ExplicitAny from "./ExplicitAny.ts";

export const rpcMap = {
  ping: {
    Params: emptyTuple,
    Response: io.literal("pong"),
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
