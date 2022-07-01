import { sqlite } from "./deps.ts";

import type { RpcImpl } from "./Rpc.ts";
import Database from "./Database.ts";
import nil from "./nil.ts";

export default function RpcImpl(): Partial<RpcImpl> {
  const db = new Database(new sqlite.DB("basic-storage.db"));

  return {
    ping() {
      return Promise.resolve("pong");
    },
    read(key, differentFrom) {
      if (differentFrom !== nil) {
        throw new Error("Not implemented");
      }

      return Promise.resolve(db.read(key));
    },
    write(key, value) {
      return Promise.resolve(db.write(key, value));
    },
    cancel(_id) {
      throw new Error("Not implemented");
    },
  };
}
