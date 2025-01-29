import {
  getUniqueId,
  type IdOrNull,
  type MergeableStore
} from "tinybase";
import {createCustomSynchronizer, Receive, Message, Send} from "tinybase/synchronizers";
import type {ListenerLambda, SenderLambda} from "@/lib/misc/browser-network";

export type RuntimeSyncOptions = {
  listener: ListenerLambda<any>
  sender: SenderLambda
}

export const createBrowserRuntimeSynchronizer = ((
  store: MergeableStore,
  options: RuntimeSyncOptions,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
) => {
  const clientId = getUniqueId();

  const send: Send = (
    toClientId: IdOrNull,
    requestId: IdOrNull,
    message: Message,
    body: any,
  ): void => {
    let msg = [clientId, toClientId, requestId, message, body];
    options.sender(msg);
  }

  let stopListening: (() => void) | null

  const registerReceive = (receive: Receive): void => {
    stopListening = options.listener((msg: any) => {
      const [fromClientId, toClientId, requestId, message, body] = msg

      if (!toClientId || toClientId === clientId)
        try {
          receive(fromClientId, requestId, message, body)
        } catch(e) {
          console.error('Error in receive', e, fromClientId, requestId, message, body);
        }
    })
  };

  const destroy = (): void => {
    if (stopListening) stopListening()
  };

  return createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    3,
    onSend,
    onReceive,
    onIgnoredError
  );
});
