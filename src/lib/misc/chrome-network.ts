import {nanoid} from "nanoid";
// @ts-ignore
import type {Runtime} from "webextension-polyfill";

function shouldSkipSend(sa: any, sb: any) {
  return sa.url === sb.url && sa.documentId === sb.documentId
}

export type Listener = {
  addListener: typeof browser.runtime.onMessage.addListener
  removeListener: typeof browser.runtime.onMessage.removeListener
}

export type Sender = {
  sendMessage: typeof browser.runtime.sendMessage
}

export function hubServer(fallback?: any) {
  const clients: {[k: string]: {sender: Runtime.MessageSender, msgs: any[]}} = {}

  const out: {sendMessage: typeof browser.runtime.sendMessage} = {
    async sendMessage(msg: any, options?: any) {
      for (const k in clients) {
        clients[k].msgs.push(msg)
      }
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
        for (const c of Object.values(clients)) {
          if (!shouldSkipSend(sender, c.sender)) c.msgs.push(msg)
        }

        if (fallback) fallback(msg, sender, sendResponse, out)
    }
  })

  return out
}

type ClientMessageListener = (msg: any) => void

export function pullListener(options?: {pullInterval?: number }) {
  const {pullInterval} = {pullInterval: 1000, ...(options ?? {})}

  const peerId = nanoid()

  chrome.runtime.sendMessage({__extensionBroadcastSync: 'connect', senderId: peerId})

  let listeners: ClientMessageListener[] = [];

  setTimeout(async function tick() {
    const msgs = await chrome.runtime.sendMessage({__extensionBroadcastSync: 'pull', senderId: peerId})

    for (const msg of msgs || []) {
      for (const l of listeners) {
        l(msg)
      }
    }

    setTimeout(tick, pullInterval)
  }, pullInterval)

  function disconnect() {
    chrome.runtime.sendMessage({__extensionBroadcastSync: 'disconnect', senderId: peerId})
  }

  window.addEventListener('beforeunload', disconnect)

  return {
    addListener(listener: ClientMessageListener) {
      listeners.push(listener)
    },

    removeListener(listener: ClientMessageListener) {
      listeners = listeners.filter(x => x !== listener)
    },

    disconnect
  } as Listener
}

export function combineSenders(...senders: any[]) {
  return {
    async sendMessage(msg: any) {
      for (const sender of senders) {
        sender.sendMessage(msg)
          .catch(() => {}) // ignore errors
      }
    }
  }
}

export function listenerIgnoringExtensionMessages(wrapper: Listener): Listener {
  return {
    addListener: (callback) => {
      wrapper.addListener((message, sender, sendResponse) => {
        // @ts-ignore
        if (message.__extensionBroadcastSync) return

        return callback(message, sender, sendResponse)
      })
    },

    removeListener: wrapper.removeListener
  }
}
