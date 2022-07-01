import { pack, unpack } from "./src/deps.ts";

import assert from "./src/assert.ts";
import assertType from "./src/assertType.ts";
import { Response, rpcMap } from "./src/Rpc.ts";
import nil from "./src/nil.ts";

assert(Deno.args.length === 1);
const [key] = Deno.args;

const sock = new WebSocket("ws://localhost:15636");

sock.onopen = () => {
  sock.send(pack({
    id: "test-read-id",
    method: "read",
    params: [new TextEncoder().encode(key)],
  }));

  sock.onmessage = async (ev) => {
    const response = unpack(new Uint8Array(await ev.data.arrayBuffer()));
    assertType(response, Response);

    if ("error" in response.result) {
      throw new Error(response.result.error.message);
    }

    assertType(response.result.ok, rpcMap.read.Response);

    if (response.result.ok instanceof Uint8Array) {
      console.log(new TextDecoder().decode(response.result.ok));
    } else {
      assert(response.result.ok === nil);
      console.log(nil);
    }

    sock.close();
  };
};
