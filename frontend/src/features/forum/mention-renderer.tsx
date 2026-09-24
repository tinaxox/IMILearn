import type { ReactNode } from "react"
import type { User } from "@/types/api"

function getFullName(member: User): string {
  return `${member.name} ${member.surname}`.trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function renderWithMentions(body: string, members: User[]): ReactNode[] {
  const names = [...new Set(members.map(getFullName).filter(Boolean))].sort((first, second) => second.length - first.length)
  if (names.length === 0) return [body]

  const mentionPattern = new RegExp(`@(?:${names.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}])`, "gu")
  const rendered: ReactNode[] = []
  let lastIndex = 0

  for (const match of body.matchAll(mentionPattern)) {
    const index = match.index
    const precedingCharacter = body[index - 1]
    if (precedingCharacter && /[\p{L}\p{N}]/u.test(precedingCharacter)) continue

    if (index > lastIndex) rendered.push(body.slice(lastIndex, index))
    rendered.push(<span key={`${index}-${match[0]}`} className="font-medium text-primary">{match[0]}</span>)
    lastIndex = index + match[0].length
  }

  if (lastIndex < body.length) rendered.push(body.slice(lastIndex))
  return rendered.length > 0 ? rendered : [body]
}
