import { pack, unpack } from "./src/deps.ts";

const sock = new WebSocket("ws://localhost:15636");

sock.onopen = () => {
  console.log("Sending ping");

  sock.send(pack({
    id: "test-id",
    method: "ping",
    params: [],
  }));

  sock.onmessage = async (ev) => {
    console.log(
      "Received",
      unpack(new Uint8Array(await ev.data.arrayBuffer())),
    );
    sock.close();
  };
};
