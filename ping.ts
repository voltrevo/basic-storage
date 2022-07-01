import { RpcWebsocket } from "./src/Rpc.ts";

const sock = await RpcWebsocket("ws://localhost:15636");

console.log(await sock.rpc.ping());

sock.close();
