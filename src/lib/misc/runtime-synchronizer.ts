import {
  createCustomSynchronizer,
  getUniqueId,
  type IdOrNull,
  type MergeableStore,
  type Message,
  type Receive
} from "tinybase";
import {Send} from "tinybase/synchronizers";

export type RuntimeSyncOptions = {
  listener: {
    addListener: typeof browser.runtime.onMessage.addListener
    removeListener: typeof browser.runtime.onMessage.removeListener
  }
  sender: { sendMessage: typeof browser.runtime.sendMessage }
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
    callback = (msg: any, sender: any, sendResponse: (x: any) => void) => {
      // @ts-ignore
      if (msg.__connType) return

      const [fromClientId, toClientId, requestId, message, body] = msg

      if (!toClientId || toClientId === clientId)
        receive(fromClientId, requestId, message, body)
      else
        console.log('ignored', clientId, msg);
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
    1,
    onSend,
    onReceive,
    onIgnoredError
  );
});
