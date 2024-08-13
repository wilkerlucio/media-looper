import {nanoid} from "nanoid";

export function backgroundListen(fallback?: any) {
  const clients: {[k: string]: any[]} = {}

  const out = {
    postMessage(msg: any) {
      for (const k in clients) {
        clients[k].push(msg)
      }
    }
  }

  chrome.runtime.onMessage.addListener((msg: any, sender, sendResponse) => {
    switch(msg.__connType) {
      case "connect":
      {
        console.log('new client connection', msg.senderId);
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
        console.log('disconnect', msg.senderId);
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

export function contentScriptListen({pullInterval = 1000}) {
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
  }
}
