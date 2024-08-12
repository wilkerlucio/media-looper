import {
  NetworkAdapter,
  type Message,
  type PeerId,
  type PeerMetadata,
} from "@automerge/automerge-repo/slim"
import {backgroundListen, contentScriptListen} from "@/lib/misc/chrome-network";

export type RuntimeChannelNetworkAdapterOptions = {
  extensionId?: string | null,
  backConn?: ReturnType<typeof backgroundListen>
  csConn?: ReturnType<typeof contentScriptListen>
}

export class RuntimeChannelNetworkAdapter extends NetworkAdapter {
  #messageEvent: any
  #options: RuntimeChannelNetworkAdapterOptions
  #connectCallback: ((message: BroadcastChannelMessage) => void) | undefined

  constructor(options?: RuntimeChannelNetworkAdapterOptions) {
    super()
    this.#options = { extensionId: null, ...(options ?? {}) }

    console.log('starting with', this.#options);

    this.#messageEvent = this.#options.csConn || chrome.runtime.onMessage
  }

  connect(peerId: PeerId, peerMetadata?: PeerMetadata) {
    this.peerId = peerId
    this.peerMetadata = peerMetadata

    this.#connectCallback = (message: BroadcastChannelMessage) => {
      if (message.__connType) return

      console.log("RECEIVED", message);

      if (message.data) message.data = new Uint8Array(message.data)

      if ("targetId" in message && message.targetId !== this.peerId) {
        return
      }

      const { senderId, type } = message

      switch (type) {
        case "arrive":
        {
          const { peerMetadata } = message as ArriveMessage
          this.postMessage({
            senderId: peerId,
            targetId: senderId,
            type: "welcome",
            peerMetadata: this.peerMetadata,
          })
          this.#announceConnection(senderId, peerMetadata)
        }
          break
        case "welcome":
        {
          const { peerMetadata } = message as WelcomeMessage
          this.#announceConnection(senderId, peerMetadata)
        }
          break
        default:
          if (!("data" in message)) {
            this.emit("message", message)
          } else {
            const data = message.data as ArrayBufferLike
            this.emit("message", {
              ...message,
              data: new Uint8Array(data),
            })
          }
          break
      }
    };

    this.#messageEvent.addListener(this.#connectCallback)

    this.postMessage({
      senderId: this.peerId,
      type: "arrive",
      peerMetadata,
    })

    this.emit("ready", { network: this })
  }

  #announceConnection(peerId: PeerId, peerMetadata: PeerMetadata) {
    this.emit("peer-candidate", { peerId, peerMetadata })
  }

  postMessage(message: Message) {
    console.log("SENDING", message);
    this.#options.backConn?.postMessage(message)

    try {
      chrome.runtime.sendMessage(message)
    } catch(e) {}
  }

  send(message: Message) {
    if ('data' in message) {
      this.postMessage({
        ...message,
        data: message.data
          ? Array.apply(null, new Uint8Array(message.data.buffer.slice(
              message.data.byteOffset,
              message.data.byteOffset + message.data.byteLength
            ))
          )          : undefined,
      })
    } else {
      this.postMessage(message)
    }
  }

  disconnect() {
    // TODO:
    if (this.#connectCallback)
      this.#messageEvent.removeListener(this.#connectCallback)

    this.#connectCallback = undefined
  }
}

/** Notify the network that we have arrived so everyone knows our peer ID */
type ArriveMessage = {
  type: "arrive"

  /** The peer ID of the sender of this message */
  senderId: PeerId

  /** The peer metadata of the sender of this message */
  peerMetadata: PeerMetadata

  /** Arrive messages don't have a targetId */
  targetId: never
}

/** Respond to an arriving peer with our peer ID */
type WelcomeMessage = {
  type: "welcome"

  /** The peer ID of the recipient sender this message */
  senderId: PeerId

  /** The peer metadata of the sender of this message */
  peerMetadata: PeerMetadata

  /** The peer ID of the recipient of this message */
  targetId: PeerId
}

type BroadcastChannelMessage = ArriveMessage | WelcomeMessage | Message
