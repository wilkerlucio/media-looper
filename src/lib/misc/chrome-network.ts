import {nanoid} from "nanoid";

export function backgroundListen(fallback?: any) {
  const clients: {[k: string]: any[]} = {}

  const out: {sendMessage: typeof browser.runtime.sendMessage} = {
    async sendMessage(msg: any, options?: any) {
      for (const k in clients) {
        clients[k].push(msg)
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg: any, sender, sendResponse) => {
    switch(msg.__connType) {
      case "connect":
      {
        clients[msg.senderId] ||= []
      }
        break
      case "pull":
      {
        sendResponse(clients[msg.senderId])

        clients[msg.senderId] = []
      }
        break
      case "disconnect":
      {
        delete clients[msg.senderId]
      }
        break
      default:
        if (fallback) fallback(msg, sender, sendResponse, out)
    }
  })

  return out
}

type Listener = (msg: any) => void

export function contentScriptListen(options?: {pullInterval?: number }) {
  const {pullInterval} = {pullInterval: 200, ...(options ?? {})}

  const peerId = nanoid()

  chrome.runtime.sendMessage({__connType: 'connect', senderId: peerId})

  let listeners: Listener[] = [];

  setTimeout(async function tick() {
    const msgs = await chrome.runtime.sendMessage({__connType: 'pull', senderId: peerId})

    for (const msg of msgs || []) {
      for (const l of listeners) {
        l(msg)
      }
    }

    setTimeout(tick, pullInterval)
  }, pullInterval)

  function disconnect() {
    chrome.runtime.sendMessage({__connType: 'disconnect', senderId: peerId})
  }

  window.addEventListener('beforeunload', disconnect)

  return {
    addListener(listener: Listener) {
      listeners.push(listener)
    },

    removeListener(listener: Listener) {
      listeners = listeners.filter(x => x !== listener)
    },

    disconnect
  } as {
    addListener: typeof browser.runtime.onMessage.addListener
    removeListener: typeof browser.runtime.onMessage.removeListener
  }
}
