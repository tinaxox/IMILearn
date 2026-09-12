import { ChevronDown, FileText, Video } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import type { Material } from "@/lib/mock";

export function FolderTree({ materials }: { materials: Material[] }) {
  const { t } = useTranslation();
  const grouped = {
    lecture: materials.filter((m) => m.type === "lecture"),
    exercise: materials.filter((m) => m.type === "exercise"),
  };

  return (
    <div className="space-y-4">
      {(["lecture", "exercise"] as const).map((type) => (
        <FolderGroup key={type} label={type === "lecture" ? t("subject.lectures") : t("subject.exercises")} items={grouped[type]} />
      ))}
    </div>
  );
}

function FolderGroup({ label, items }: { label: string; items: Material[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        <span>{label} <span className="ml-2 text-xs font-normal text-muted-foreground">({items.length})</span></span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <ul className="divide-y">
          {items.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">{t("materials.nothingHereYet")}</li>}
          {items.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="text-sm font-medium">{m.title}</div>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {m.files.map((f) => (
                  <span key={f.name} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                    <FileText className="h-3 w-3" /> {f.name}
                  </span>
                ))}
                {m.recordings.map((r) => (
                  <span key={r.name} className="inline-flex items-center gap-1 rounded-md bg-[rgb(255,226,228)] px-2 py-1 text-xs text-[rgb(150,0,43)]">
                    <Video className="h-3 w-3" /> {r.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
