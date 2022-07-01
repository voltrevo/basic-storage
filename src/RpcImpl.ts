import { base64, EventEmitter, sqlite } from "./deps.ts";

import type { RpcImpl } from "./Rpc.ts";
import Database from "./Database.ts";
import nil from "./nil.ts";
import optionalBuffersEqual from "./optionalBuffersEqual.ts";

export default function RpcImpl(): Partial<RpcImpl> {
  Deno.mkdir("data", { recursive: true });
  const db = new Database(new sqlite.DB("data/basic-storage.db"));

  const changeEvents = new EventEmitter<
    { [key: string]: (value: Uint8Array | nil) => void }
  >();

  const cancelMap: Record<string, (() => void) | undefined> = {};

  return {
    ping() {
      return Promise.resolve("pong");
    },
    read(key, differentFrom) {
      const currentValue = db.read(key);

      if (
        differentFrom === nil ||
        !optionalBuffersEqual(differentFrom.value, currentValue)
      ) {
        return Promise.resolve(currentValue);
      }

      return new Promise((resolve) => {
        const encodedKey = base64.encode(key);

        const changeHandler = (newValue: Uint8Array | nil) => {
          if (!optionalBuffersEqual(differentFrom.value, newValue)) {
            cleanup();
            resolve(newValue);
          }
        };

        const timerId = setTimeout(() => {
          cleanup();
          resolve("please-retry");
        }, 300_000);

        cancelMap[differentFrom.cancelId] = () => {
          cleanup();
          resolve("cancelled");
        };

        const cleanup = () => {
          changeEvents.off(encodedKey, changeHandler);
          clearTimeout(timerId);
          delete cancelMap[differentFrom.cancelId];
        };

        changeEvents.on(encodedKey, changeHandler);
      });
    },
    write(key, value) {
      db.write(key, value);
      changeEvents.emit(base64.encode(key), value);

      return Promise.resolve();
    },
    cancel(cancelId) {
      cancelMap[cancelId]?.();
      return Promise.resolve();
    },
  };
}
