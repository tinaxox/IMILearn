import { cn } from "@/lib/utils"

const yearColors: Record<number, string> = {
  1: "text-[#1748d8]",
  2: "text-[#176b45]",
  3: "text-[#85600c]",
  4: "text-[#a52b4a]",
  5: "text-[#673ab7]",
  6: "text-[#176a73]",
}

export function YearBadge({ year, className }: { year: number; className?: string }) {
  return <span className={cn(yearColors[year] ?? "text-muted-foreground", className)}>Year {year}</span>
}
