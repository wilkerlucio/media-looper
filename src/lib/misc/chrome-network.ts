import {nanoid} from "nanoid";

function shouldSend(sa: any, sb: any) {
  return sa.origin === sb.origin
}

export function backgroundListen(fallback?: any) {
  const clients: {[k: string]: {sender: chrome.runtime.MessageSender, msgs: any[]}} = {}

  const out: {sendMessage: typeof browser.runtime.sendMessage} = {
    async sendMessage(msg: any, options?: any) {
      for (const k in clients) {
        clients[k].msgs.push(msg)
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg: any, sender, sendResponse) => {
    switch(msg.__connType) {
      case "connect":
      {
        clients[msg.senderId] ||= {sender: sender, msgs: []}
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
          if (!shouldSend(sender, c.sender)) c.msgs.push(msg)
        }

        if (fallback) fallback(msg, sender, sendResponse, out)
    }
  })

  return out
}

type Listener = (msg: any) => void

export function contentScriptListen(options?: {pullInterval?: number }) {
  const {pullInterval} = {pullInterval: 1000, ...(options ?? {})}

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
