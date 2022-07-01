import assert from "./src/assert.ts";
import { RpcWebsocket } from "./src/Rpc.ts";

assert(Deno.args.length === 1);
const [cancelId] = Deno.args;

const sock = await RpcWebsocket("ws://localhost:15636");

await sock.rpc.cancel(cancelId);

sock.close();
