import {type Message, NetworkAdapter, type PeerId, type PeerMetadata,} from "@automerge/automerge-repo/slim"
import {ListenerLambda, SenderLambda} from "@/lib/misc/browser-network";

export type RuntimeChannelNetworkAdapterOptions = {
  listener: ListenerLambda<any>
  sender: SenderLambda
}

export class RuntimeChannelNetworkAdapter extends NetworkAdapter {
  #options: RuntimeChannelNetworkAdapterOptions
  #connectCallback: ((message: BroadcastChannelMessage) => void) | undefined
  #unlisten: any

  constructor(options: RuntimeChannelNetworkAdapterOptions) {
    super()
    this.#options = options
  }

  connect(peerId: PeerId, peerMetadata?: PeerMetadata) {
    this.peerId = peerId
    this.peerMetadata = peerMetadata

    this.#connectCallback = (message: BroadcastChannelMessage) => {
      // @ts-ignore
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
            // @ts-ignore
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

    this.#unlisten = this.#options.listener(this.#connectCallback)

    this.postMessage({
      senderId: this.peerId,
      type: "arrive",
      // @ts-ignore
      peerMetadata,
    })

    this.emit("ready", { network: this })
  }

  #announceConnection(peerId: PeerId, peerMetadata: PeerMetadata) {
    this.emit("peer-candidate", { peerId, peerMetadata })
  }

  postMessage(message: Message) {
    this.#options.sender(message)
  }

  send(message: Message) {
    if ('data' in message) {
      this.postMessage({
        ...message,
        // @ts-ignore
        data: message.data
          // @ts-ignore
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
    if (this.#unlisten)
      this.#unlisten()

    this.#unlisten = undefined
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
