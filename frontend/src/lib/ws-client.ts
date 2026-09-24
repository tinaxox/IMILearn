import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { getStoredAuth } from "@/lib/api-client"

let client: Client | null = null
const listeners = new Map<string, Set<(payload: unknown) => void>>()
const subscriptions = new Map<string, StompSubscription>()

function subscribeConnected(destination: string) {
  if (!client?.connected || subscriptions.has(destination)) return
  subscriptions.set(destination, client.subscribe(destination, (message: IMessage) => {
    try {
      const payload = JSON.parse(message.body) as unknown
      listeners.get(destination)?.forEach((listener) => listener(payload))
    } catch {
      // Ignore malformed messages from the broker.
    }
  }))
}

export function getStompClient(): Client {
  if (client) return client
  client = new Client({
    // Force the plain WebSocket transport: SockJS's HTTP-streaming/polling fallbacks
    // don't reliably surface a close event when the server disappears (e.g. a backend
    // restart), so the client can be left "connected" but dead until the page is
    // reloaded. A real WebSocket closes promptly, letting stomp.js's reconnect kick in.
    // The token is also passed as a query param (read at handshake time, not just on the
    // STOMP CONNECT frame) - that's what actually registers this session in Spring's
    // per-user destination registry, which convertAndSendToUser depends on.
    webSocketFactory: () => new SockJS(`/ws?token=${encodeURIComponent(getStoredAuth()?.token ?? "")}`, null, { transports: ["websocket"] }),
    reconnectDelay: 5000,
    // Re-read the token on every (re)connect attempt instead of freezing it at client
    // creation, so a token obtained after this module first loaded is still picked up.
    beforeConnect: (activeClient) => {
      activeClient.connectHeaders = { Authorization: `Bearer ${getStoredAuth()?.token ?? ""}` }
    },
    onConnect: () => listeners.forEach((_, destination) => subscribeConnected(destination)),
    onDisconnect: () => subscriptions.clear(),
    onWebSocketClose: () => subscriptions.clear(),
  })
  client.activate()
  return client
}

export function subscribeToTopic(destination: string, onMessage: (payload: unknown) => void): () => void {
  getStompClient()

  const topicListeners = listeners.get(destination) ?? new Set<(payload: unknown) => void>()
  topicListeners.add(onMessage)
  listeners.set(destination, topicListeners)
  subscribeConnected(destination)

  return () => {
    const currentListeners = listeners.get(destination)
    currentListeners?.delete(onMessage)
    if (!currentListeners?.size) {
      listeners.delete(destination)
      subscriptions.get(destination)?.unsubscribe()
      subscriptions.delete(destination)
    }
  }
}

export function disconnectStompClient(): void {
  listeners.clear()
  subscriptions.clear()
  if (client) void client.deactivate()
  client = null
}
