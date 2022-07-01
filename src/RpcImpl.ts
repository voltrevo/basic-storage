import { sqlite } from "./deps.ts";

import type { RpcImpl } from "./Rpc.ts";
import Database from "./Database.ts";

export default function RpcImpl(): RpcImpl {
  const db = new Database(new sqlite.DB("basic-storage.db"));

  return {
    ping() {
      return Promise.resolve("pong");
    },
  };
}
