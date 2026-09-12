import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  admin:     "bg-[rgb(255,226,228)] text-[rgb(150,0,43)]",
  professor: "bg-[rgb(240,233,255)] text-[rgb(81,43,146)]",
  assistant: "bg-[rgb(202,247,255)] text-[rgb(0,84,116)]",
  student:   "bg-[rgb(208,250,230)] text-[rgb(0,85,50)]",
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors[role] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {role}
    </span>
  );
}
