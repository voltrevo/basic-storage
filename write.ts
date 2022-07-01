import assert from "./src/assert.ts";
import { RpcWebsocket } from "./src/Rpc.ts";
import nil from "./src/nil.ts";

assert([1, 2].includes(Deno.args.length));
const [key, value] = Deno.args as [string, string | nil];

const sock = await RpcWebsocket("ws://localhost:15636");

sock.rpc.write(
  new TextEncoder().encode(key),
  value === nil ? nil : new TextEncoder().encode(value),
);

sock.close();
