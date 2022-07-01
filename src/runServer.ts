import { pack, serve, unpack } from "./deps.ts";

import assertType from "./assertType.ts";
import { Request, rpcMap } from "./Rpc.ts";
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
      const request = unpack(ev.data);
      assertType(request, Request);
      assertType(request.params, rpcMap[request.method].Params);

      const response = await (rpcImpl[request.method] as ExplicitAny)(
        ...request.params,
      );

      return pack({
        id: request.id,
        response,
      });
    };

    return response;
  }

  serve(reqHandler, { port: 15636 });
}
