import { pack, unpack } from "./src/deps.ts";

import assert from "./src/assert.ts";
import assertType from "./src/assertType.ts";
import { Response, rpcMap } from "./src/Rpc.ts";

assert(Deno.args.length === 2);
const [key, value] = Deno.args;

const sock = new WebSocket("ws://localhost:15636");

sock.onopen = () => {
  sock.send(pack({
    id: "test-write-id",
    method: "write",
    params: [
      new TextEncoder().encode(key),
      new TextEncoder().encode(value),
    ],
  }));

  sock.onmessage = async (ev) => {
    const response = unpack(new Uint8Array(await ev.data.arrayBuffer()));
    assertType(response, Response);

    if ("error" in response.result) {
      throw new Error(response.result.error.message);
    }

    assertType(response.result.ok, rpcMap.write.Response);

    sock.close();
  };
};
