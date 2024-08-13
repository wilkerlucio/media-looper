import {
  createCustomSynchronizer,
  getUniqueId,
  type IdOrNull,
  type MergeableStore,
  type Message,
  type Receive
} from "tinybase";
import {Send} from "tinybase/synchronizers";

export const createBrowserRuntimeSynchronizer = ((
  store: MergeableStore,
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
    browser.runtime.sendMessage([clientId, toClientId, requestId, message, body]);
  }

  const registerReceive = (receive: Receive): void => {
    const callback = (msg: any, sender: any, sendResponse: (x: any) => void) => {
      if (msg === 'ping') {
        sendResponse(null)
        return
      }

      const [fromClientId, toClientId, requestId, message, body] = msg

      if (!toClientId || toClientId === clientId && message) {
        sendResponse(receive(fromClientId, requestId, message, body))
      } else {
        sendResponse(0)
      }
    };

    browser.runtime.onMessage.addListener(
      callback
    )
  };

  const destroy = (): void => {
    // channel.close();
  };

  return createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    0.01,
    onSend,
    onReceive,
    onIgnoredError
  );
});
