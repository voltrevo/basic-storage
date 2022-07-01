import assert from "./src/assert.ts";
import { RpcWebsocket } from "./src/Rpc.ts";
import nil from "./src/nil.ts";
import RandomId from "./src/RandomId.ts";

assert(Deno.args.length === 1);
const [key] = Deno.args;

const sock = await RpcWebsocket("ws://localhost:15636");

const keyBytes = new TextEncoder().encode(key);

async function fullRead(differentFrom: { value: Uint8Array | nil } | nil) {
  const differentFromWithId = differentFrom === nil ? nil : {
    ...differentFrom,
    cancelId: RandomId(),
  };

  while (true) {
    const readOutput = await sock.rpc.read(keyBytes, differentFromWithId);

    if (readOutput === "please-retry") {
      continue;
    }

    assert(readOutput !== "cancelled");

    return readOutput;
  }
}

function display(v: Uint8Array | nil) {
  if (v instanceof Uint8Array) {
    console.log(new TextDecoder().decode(v));
  } else {
    console.log(v);
  }
}

let value = await fullRead(nil);
display(value);

while (true) {
  value = await fullRead({ value });
  display(value);
}
