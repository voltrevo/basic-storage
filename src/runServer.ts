import { pack, serve, unpack } from "./deps.ts";

import assertType from "./assertType.ts";
import { Request as RpcRequest, rpcMap } from "./Rpc.ts";
import RpcImpl from "./RpcImpl.ts";
import ExplicitAny from "./ExplicitAny.ts";

export default function runServer() {
  const rpcImpl = RpcImpl();

  function reqHandler(req: Request) {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }

    const { socket: ws, response } = Deno.upgradeWebSocket(req);

    ws.onmessage = async (ev) => {
      const request = unpack(new Uint8Array(ev.data));
      assertType(request, RpcRequest);
      assertType(request.params, rpcMap[request.method].Params as ExplicitAny);

      console.log({ request });

      let result;

      try {
        result = {
          ok: await (rpcImpl[request.method] as ExplicitAny)(
            ...request.params,
          ),
        };
      } catch (error) {
        console.error(request.id, error);

        result = {
          error: {
            message: `See server logs for id ${request.id}`,
          },
        };
      }

      const response = {
        id: request.id,
        result,
      };

      console.log({ response });

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(pack(response));
      }
    };

    return response;
  }

  const port = 15636;
  serve(reqHandler, { port });
  console.log(`basic-storage running on port ${port}`);
}
