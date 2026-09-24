export { cn } from "cn"

export function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "U"
}

export function truncateFileName(fileName: string, maxLength = 24): string {
  if (fileName.length <= maxLength) return fileName
  const dotIndex = fileName.lastIndexOf(".")
  const extension = dotIndex > 0 ? fileName.slice(dotIndex) : ""
  const base = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName
  const keep = Math.max(maxLength - extension.length - 1, 1)
  return `${base.slice(0, keep)}…${extension}`
}

export function formatDateTime(value: string | number | Date): string {
  const date = new Date(value)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`
}
