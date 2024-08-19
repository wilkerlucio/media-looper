import {
  createCustomSynchronizer,
  getUniqueId,
  type IdOrNull,
  type MergeableStore,
  type Message,
  type Receive
} from "tinybase";
import {Send} from "tinybase/synchronizers";
import type {Listener, Sender} from "@/lib/misc/chrome-network";

export type RuntimeSyncOptions = {
  listener: Listener
  sender: Sender
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
    console.log('send', msg);

    options.sender.sendMessage(msg);
  }

  let callback

  const registerReceive = (receive: Receive): void => {
    callback = (msg: any) => {
      console.log('received', msg);

      const [fromClientId, toClientId, requestId, message, body] = msg

      if (!toClientId || toClientId === clientId)
        receive(fromClientId, requestId, message, body)
    };

    options.listener.addListener(
      callback
    )
  };

  const destroy = (): void => {
    callback ||= null

    options.listener.removeListener(callback)
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