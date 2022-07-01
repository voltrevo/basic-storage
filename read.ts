import assert from "./src/assert.ts";
import { RpcWebsocket } from "./src/Rpc.ts";
import nil from "./src/nil.ts";

assert(Deno.args.length === 1);
const [key] = Deno.args;

const sock = await RpcWebsocket("ws://localhost:15636");

const value = await sock.rpc.read(new TextEncoder().encode(key), nil);

if (value instanceof Uint8Array) {
  console.log(new TextDecoder().decode(value));
} else {
  console.log(value);
}

sock.close();
