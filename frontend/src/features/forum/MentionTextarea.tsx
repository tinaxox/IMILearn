import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import type { ComponentProps, KeyboardEvent, MouseEvent } from "react"
import { createPortal } from "react-dom"
import { cn } from "cn"
import { Textarea } from "@/components/ui/textarea"
import { renderWithMentions } from "@/features/forum/mention-renderer"
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

const DROPDOWN_MAX_HEIGHT = 224
const DROPDOWN_GAP = 4

function getFullName(member: User): string {
  return `${member.name} ${member.surname}`.trim()
}

function findActiveMention(value: string, cursor: number): ActiveMention | null {
  for (let index = cursor - 1; index >= 0 && value[index] !== "\n"; index -= 1) {
    if (value[index] !== "@") continue

    const precedingCharacter = value[index - 1]
    if (precedingCharacter && /[\p{L}\p{N}]/u.test(precedingCharacter)) return null

    return { start: index, end: cursor, query: value.slice(index + 1, cursor) }
  }

  return null
}

export const MentionTextarea = forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  function MentionTextarea(
    { subjectMembers, value, onChange, onBlur, onClick, onKeyDown, onKeyUp, ...props },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const backdropRef = useRef<HTMLDivElement | null>(null)
    const [activeMention, setActiveMention] = useState<ActiveMention | null>(null)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [dropdownRect, setDropdownRect] = useState<{
      left: number
      width: number
      top?: number
      bottom?: number
      maxHeight: number
    } | null>(null)

    const matches = useMemo(() => {
      if (!activeMention) return []
      const query = activeMention.query.toLocaleLowerCase()

      return subjectMembers
        .filter((member) => {
          const fullName = getFullName(member).toLocaleLowerCase()
          return (
            fullName.startsWith(query) ||
            member.name.toLocaleLowerCase().startsWith(query) ||
            member.surname.toLocaleLowerCase().startsWith(query)
          )
        })
        .slice(0, 6)
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
        if (!rect) return

        const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP * 2
        const spaceAbove = rect.top - DROPDOWN_GAP * 2
        const openAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow

        setDropdownRect(
          openAbove
            ? {
                left: rect.left,
                width: rect.width,
                bottom: window.innerHeight - rect.top + DROPDOWN_GAP,
                maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, spaceAbove),
              }
            : {
                left: rect.left,
                width: rect.width,
                top: rect.bottom + DROPDOWN_GAP,
                maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, spaceBelow),
              },
        )
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
        setHighlightedIndex((current) =>
          current === -1
            ? direction === 1
              ? 0
              : matches.length - 1
            : (current + direction + matches.length) % matches.length,
        )
      } else if ((event.key === "Enter" || event.key === "Tab") && highlightedIndex !== -1) {
        event.preventDefault()
        selectMember(matches[Math.min(highlightedIndex, matches.length - 1)])
      } else if (event.key === "Escape") {
        event.preventDefault()
        setActiveMention(null)
      }
    }

    return (
      <div className="relative rounded-lg bg-white dark:bg-input/30">
        <div
          ref={backdropRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap wrap-break-word rounded-lg border border-transparent px-3 py-2.5 text-base md:text-sm"
        >
          {renderWithMentions(value, subjectMembers, "text-primary")}{" "}
        </div>
        <Textarea
          {...props}
          className={cn(
            "relative bg-transparent text-transparent caret-foreground dark:bg-transparent",
            props.className,
          )}
          onScroll={(event) => {
            if (backdropRef.current) backdropRef.current.scrollTop = event.currentTarget.scrollTop
            props.onScroll?.(event)
          }}
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
            const handledArrowKey =
              dropdownOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")
            if (event.key !== "Escape" && !handledArrowKey) trackCursor()
            onKeyUp?.(event)
          }}
          aria-autocomplete="list"
          aria-expanded={dropdownOpen}
        />
        {dropdownOpen &&
          dropdownRect &&
          createPortal(
            <div
              role="listbox"
              style={{
                position: "fixed",
                left: dropdownRect.left,
                top: dropdownRect.top,
                bottom: dropdownRect.bottom,
                width: dropdownRect.width,
                maxHeight: dropdownRect.maxHeight,
              }}
              className="z-50 flex flex-col gap-1 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {matches.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none ${index === highlightedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectMember(member)}
                >
                  {getFullName(member)}
                </button>
              ))}
            </div>,
            document.body,
          )}
      </div>
    )
  },
)
