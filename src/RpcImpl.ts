import type { RpcImpl } from "./Rpc.ts";

export default function RpcImpl(): RpcImpl {
  return {
    ping() {
      return Promise.resolve("pong");
    },
  };
}
