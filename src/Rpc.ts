import { io, mapValues, pack, unpack } from "./deps.ts";

import emptyTuple from "./emptyTuple.ts";
import ExplicitAny from "./ExplicitAny.ts";
import ioBuffer from "./ioBuffer.ts";
import RandomId from "./RandomId.ts";
import assert from "./assert.ts";
import assertType from "./assertType.ts";
import nil from "./nil.ts";

export const rpcMap = {
  ping: {
    Params: emptyTuple,
    Output: io.literal("pong"),
  },
  read: {
    Params: io.tuple([
      ioBuffer,
      io.union([
        io.undefined,
        io.type({
          cancelId: io.string,
          value: io.union([io.undefined, ioBuffer]),
        }),
      ]),
    ]),
    Output: io.union([
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
    Output: io.void,
  },
  cancel: {
    Params: io.tuple([io.string]),
    Output: io.void,
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

export type Request = io.TypeOf<typeof Request>;

export type RpcImpl = {
  [M in RequestMethodName]: (
    ...params: io.TypeOf<RpcMap[M]["Params"]>
  ) => Promise<io.TypeOf<RpcMap[M]["Output"]>>;
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

export type Response = io.TypeOf<typeof Response>;

type RpcClient = {
  [M in RequestMethodName]: (
    ...params: io.TypeOf<RpcMap[M]["Params"]>
  ) => Promise<io.TypeOf<RpcMap[M]["Output"]>>;
};

export function RpcClient(
  send: (request: Request) => void,
  setMessageHandler: (handler: (response: unknown) => void) => void,
): RpcClient {
  const handlers: Record<string, ((response: Response) => void) | nil> = {};

  setMessageHandler((response) => {
    assertType(response, Response);
    const handler = handlers[response.id];
    assert(handler !== nil);
    delete handlers[response.id];
    handler(response);
  });

  return mapValues(rpcMap, ({ Output }, method) =>
    (...params: unknown[]) => {
      const id = RandomId();

      send({
        id,
        method,
        params,
      });

      return new Promise<ExplicitAny>((resolve, reject) => {
        handlers[id] = (response) => {
          if ("error" in response.result) {
            reject(new Error(response.result.error.message));
            return;
          }

          assertType(response.result.ok, Output as ExplicitAny);
          resolve(response.result.ok);
        };
      });
    });
}

export async function RpcWebsocket(
  address: string,
): Promise<{ rpc: RpcClient; close: () => void }> {
  const ws = new WebSocket(address);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = (ev) =>
      reject(new Error("message" in ev ? ev.message : "unexpected ws error"));
  });

  const rpc = RpcClient(
    (request) => ws.send(pack(request)),
    (handler) => {
      ws.onmessage = async (ev) =>
        handler(unpack(new Uint8Array(await ev.data.arrayBuffer())));
    },
  );

  return {
    rpc,
    close: () => {
      ws.close();
    },
  };
}
