import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react"
import { createPortal } from "react-dom"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/types/api"

interface ActiveMention {
  start: number
  end: number
  query: string
}

type MentionTextareaProps = Omit<ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  value: string
  onChange: (value: string) => void
  subjectMembers: User[]
}

function getFullName(member: User): string {
  return `${member.name} ${member.surname}`.trim()
}

function findActiveMention(value: string, cursor: number): ActiveMention | null {
  for (let index = cursor - 1; index >= 0 && !/\s/u.test(value[index]); index -= 1) {
    if (value[index] !== "@") continue

    const precedingCharacter = value[index - 1]
    if (precedingCharacter && /[\p{L}\p{N}]/u.test(precedingCharacter)) return null

    return { start: index, end: cursor, query: value.slice(index + 1, cursor) }
  }

  return null
}

export const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(function MentionTextarea(
  { subjectMembers, value, onChange, onBlur, onClick, onKeyDown, onKeyUp, ...props },
  forwardedRef,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [dropdownRect, setDropdownRect] = useState<{ left: number; top: number; width: number } | null>(null)

  const matches = useMemo(() => {
    if (!activeMention) return []
    const query = activeMention.query.toLocaleLowerCase()

    return subjectMembers.filter((member) => {
      const fullName = getFullName(member).toLocaleLowerCase()
      return fullName.startsWith(query) || member.name.toLocaleLowerCase().startsWith(query) || member.surname.toLocaleLowerCase().startsWith(query)
    }).slice(0, 6)
  }, [activeMention, subjectMembers])

  const trackCursor = (nextValue = value, cursor = textareaRef.current?.selectionStart ?? 0) => {
    const nextMention = findActiveMention(nextValue, cursor)
    setActiveMention(nextMention)
    setHighlightedIndex(-1)
  }

  const selectMember = (member: User) => {
    if (!activeMention) return
    const insertion = `@${getFullName(member)} `
    const nextValue = `${value.slice(0, activeMention.start)}${insertion}${value.slice(activeMention.end)}`
    const nextCursor = activeMention.start + insertion.length

    onChange(nextValue)
    setActiveMention(null)
    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const dropdownOpen = matches.length > 0

  useEffect(() => {
    if (!dropdownOpen) return

    const updateRect = () => {
      const rect = textareaRef.current?.getBoundingClientRect()
      if (rect) setDropdownRect({ left: rect.left, top: rect.bottom, width: rect.width })
    }

    updateRect()
    window.addEventListener("scroll", updateRect, true)
    window.addEventListener("resize", updateRect)
    return () => {
      window.removeEventListener("scroll", updateRect, true)
      window.removeEventListener("resize", updateRect)
    }
  }, [dropdownOpen])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !dropdownOpen) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const direction = event.key === "ArrowDown" ? 1 : -1
      setHighlightedIndex((current) => current === -1
        ? (direction === 1 ? 0 : matches.length - 1)
        : (current + direction + matches.length) % matches.length)
    } else if ((event.key === "Enter" || event.key === "Tab") && highlightedIndex !== -1) {
      event.preventDefault()
      selectMember(matches[Math.min(highlightedIndex, matches.length - 1)])
    } else if (event.key === "Escape") {
      event.preventDefault()
      setActiveMention(null)
    }
  }

  return <div className="relative">
    <Textarea
      {...props}
      ref={(element) => {
        textareaRef.current = element
        if (typeof forwardedRef === "function") forwardedRef(element)
        else if (forwardedRef) forwardedRef.current = element
      }}
      value={value}
      onChange={(event) => {
        const nextValue = event.currentTarget.value
        const cursor = event.currentTarget.selectionStart
        onChange(nextValue)
        trackCursor(nextValue, cursor)
      }}
      onBlur={(event) => {
        setActiveMention(null)
        onBlur?.(event)
      }}
      onClick={(event: MouseEvent<HTMLTextAreaElement>) => {
        trackCursor()
        onClick?.(event)
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={(event) => {
        const handledArrowKey = dropdownOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")
        if (event.key !== "Escape" && !handledArrowKey) trackCursor()
        onKeyUp?.(event)
      }}
      aria-autocomplete="list"
      aria-expanded={dropdownOpen}
    />
    {dropdownOpen && dropdownRect && createPortal(
      <div
        role="listbox"
        style={{ position: "fixed", left: dropdownRect.left, top: dropdownRect.top, width: dropdownRect.width }}
        className="z-50 mt-1 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        {matches.map((member, index) => <button
          key={member.id}
          type="button"
          role="option"
          aria-selected={index === highlightedIndex}
          className={`flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none ${index === highlightedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => selectMember(member)}
        >
          {getFullName(member)}
        </button>)}
      </div>,
      document.body,
    )}
  </div>
})
