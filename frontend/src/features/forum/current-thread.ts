const currentThreadIds = new Map<number, number>()

export function getCurrentForumThreadId(): number | null {
  return currentThreadIds.keys().next().value ?? null
}

export function setCurrentForumThreadId(id: number | null): void {
  currentThreadIds.clear()
  if (id !== null) currentThreadIds.set(id, 1)
}

export function isCurrentForumThreadId(id: number | null): boolean {
  return id !== null && currentThreadIds.has(id)
}

export function registerCurrentForumThreadId(id: number): () => void {
  currentThreadIds.set(id, (currentThreadIds.get(id) ?? 0) + 1)

  return () => {
    const count = currentThreadIds.get(id) ?? 0
    if (count <= 1) currentThreadIds.delete(id)
    else currentThreadIds.set(id, count - 1)
  }
}
