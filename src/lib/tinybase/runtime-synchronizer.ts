import {
  createCustomSynchronizer,
  getUniqueId,
  type IdOrNull,
  type MergeableStore,
  type Message,
  type Receive
} from "tinybase";
import {Send} from "tinybase/synchronizers";
import type {ListenerLambda, SenderLambda} from "@/lib/misc/chrome-network";

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

  const send = (
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
    const callback = (msg: any) => {
      const [fromClientId, toClientId, requestId, message, body] = msg

      if (!toClientId || toClientId === clientId)
        receive(fromClientId, requestId, message, body)
    }

    stopListening = options.listener(callback)
  };

  const destroy = (): void => {
    if (stopListening) stopListening()
  };

  return createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    2,
    onSend,
    onReceive,
    onIgnoredError
  );
});
