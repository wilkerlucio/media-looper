import {nanoid} from "nanoid";
// @ts-ignore
import type {Runtime} from "webextension-polyfill";

export type ListenerLambda<T extends (...args: any[]) => any> = (callback: T) => () => void
export type SenderLambda = (msg: any) => Promise<any> | void

export function chromeStyleListener(wrapper: typeof browser.runtime.onMessage): ListenerLambda<any> {
  return (callback: any) => {
    wrapper.addListener(callback)

    return () => wrapper.removeListener(callback)
  }
}

export const runtimeOnMessageListener = chromeStyleListener(browser.runtime.onMessage)
export const runtimeOnMessageSender: SenderLambda = async (msg: any) => {
  return browser.runtime.sendMessage(msg).catch(() => null)
}

export function multiSender(...senders: SenderLambda[]) {
  return async (msg: any) => {
    for (const sender of senders) {
      sender(msg)
    }
  }
}

// region: channels

export type ChannelMessage = {
  __channel: string,
  contents: any
}

export function channelListener(listener: ListenerLambda<any>, channelName: string): ListenerLambda<any> {
  return (callback: any) => {
    return listener((msg: ChannelMessage) => {
      if (msg.__channel !== channelName) return

      return callback(msg.contents)
    })
  }
}

export function channelSender(sender: SenderLambda, channelName: string) {
  return (msg: any) => {
    return sender({__channel: channelName, contents: msg})
  }
}

// endregion

// region: pulling clients

function shouldSkipSend(sa: any, sb: any) {
  return sa.url === sb.url && sa.documentId === sb.documentId
}

export function hubServer() {
  const clients: {[k: string]: {sender: Runtime.MessageSender, msgs: any[]}} = {}

  const sender: SenderLambda = async (msg: any, options?: any) => {
    for (const k in clients) {
      clients[k].msgs.push(msg)
    }
  }

  browser.runtime.onMessage.addListener((msg: any, sender, sendResponse: (x: any) => void) => {
    switch(msg.__extensionBroadcastSync) {
      case "connect":
      {
        clients[msg.senderId] ||= {sender, msgs: []}
      }
        break
      case "pull":
      {
        sendResponse(clients[msg.senderId].msgs)

        clients[msg.senderId].msgs = []
      }
        break
      case "disconnect":
      {
        delete clients[msg.senderId]
      }
        break
      default:
        // forward other messages to all pull connected clients
        for (const c of Object.values(clients)) {
          if (!shouldSkipSend(sender, c.sender)) c.msgs.push(msg)
        }
    }
  })

  return sender
}

type ClientMessageListener = (msg: any) => void

export function pullListener(options?: {pullInterval?: number }) {
  const {pullInterval} = {pullInterval: 1000, ...(options ?? {})}

  const peerId = nanoid()

  browser.runtime.sendMessage({__extensionBroadcastSync: 'connect', senderId: peerId})

  let listeners: ClientMessageListener[] = [];

  setTimeout(async function tick() {
    const msgs = await browser.runtime.sendMessage({__extensionBroadcastSync: 'pull', senderId: peerId})

    for (const msg of msgs || []) {
      for (const l of listeners) {
        l(msg)
      }
    }

    setTimeout(tick, pullInterval)
  }, pullInterval)

  function disconnect() {
    browser.runtime.sendMessage({__extensionBroadcastSync: 'disconnect', senderId: peerId})
  }

  window.addEventListener('beforeunload', disconnect)

  const listener = (callback: ClientMessageListener) => {
    listeners.push(callback)

    return () => listeners.filter(x => x !== callback)
  }

  listener.disconnect = disconnect

  return listener
}

// endregion
