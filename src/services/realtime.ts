
export interface RealtimeEvent<T = unknown> {
  eventId: string
  resource: 'nft' | 'order'
  resourceId: string
  version: number
  userId?: string
  data: T
}

export function createRealtimeEventGuard() {
  const processedEvents = new Set<string>()
  const latestVersions = new Map<string, number>()

  function isNewEvent(event: RealtimeEvent): boolean {
    // Impede o processamento do mesmo evento duas vezes.
    if (processedEvents.has(event.eventId)) {
      return false
    }

    const resourceKey = `${event.resource}:${event.resourceId}`
    const latestVersion = latestVersions.get(resourceKey) ?? 0

    // Impede que uma versão antiga ou repetida sobrescreva a atual.
    if (event.version <= latestVersion) {
      return false
    }

    processedEvents.add(event.eventId)
    latestVersions.set(resourceKey, event.version)

    // Limita o histórico de IDs para evitar crescimento indefinido.
    if (processedEvents.size > 500) {
      const oldestEvent = processedEvents.values().next().value

      if (oldestEvent) {
        processedEvents.delete(oldestEvent)
      }
    }

    return true
  }

  return { isNewEvent }
}
