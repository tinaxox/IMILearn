import { cn } from "@/lib/utils";

export function ScoreChip({
  score,
  max,
  size = "sm",
  className,
}: {
  score?: number | null;
  max?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasScore = typeof score === "number" && typeof max === "number" && max > 0;
  const pct = hasScore ? (score! / max!) * 100 : 0;

  let tone = "bg-muted text-muted-foreground";
  if (hasScore) {
    if (pct >= 85) tone = "bg-[rgb(174,252,217)] text-[rgb(0,68,34)]";
    else if (pct >= 65) tone = "bg-[rgb(198,251,207)] text-[rgb(0,74,30)]";
    else if (pct >= 50) tone = "bg-[rgb(255,235,169)] text-[rgb(119,48,0)]";
    else tone = "bg-[rgb(255,217,220)] text-[rgb(150,0,43)]";
  }

  const sizes = {
    sm: "h-6 min-w-6 px-2 text-xs",
    md: "h-8 min-w-8 px-2.5 text-sm",
    lg: "h-11 min-w-11 px-3 text-base",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tabular-nums",
        tone,
        sizes,
        className,
      )}
      title={hasScore ? `${score} / ${max}` : "No score"}
    >
      {hasScore ? score : "—"}
    </span>
  );
}
