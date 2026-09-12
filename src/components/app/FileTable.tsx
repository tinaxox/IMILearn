import { FileText, Video, File as FileIcon } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { useTranslation } from "@/lib/i18n";
import type { MaterialFile } from "@/lib/mock";

export interface FileTableRow {
  id: string;
  name: string;
  kind: MaterialFile["kind"];
  date: string;
  by: string;
}

const kindStyle: Record<MaterialFile["kind"], { icon: typeof FileText; bg: string; text: string }> = {
  pdf: { icon: FileText, bg: "bg-[rgb(255,226,228)]", text: "text-[rgb(150,0,43)]" },
  slides: { icon: FileText, bg: "bg-[rgb(255,226,228)]", text: "text-[rgb(150,0,43)]" },
  video: { icon: Video, bg: "bg-[rgb(214,242,255)]", text: "text-[rgb(0,68,149)]" },
  other: { icon: FileIcon, bg: "bg-muted", text: "text-muted-foreground" },
};

export function FileTable({ rows, emptyTitle, emptyDescription }: { rows: FileTableRow[]; emptyTitle: string; emptyDescription?: string }) {
  const { t } = useTranslation();
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5">{t("fileTable.name")}</th>
            <th className="px-4 py-2.5">{t("fileTable.modified")}</th>
            <th className="px-4 py-2.5">{t("fileTable.modifiedBy")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => {
            const style = kindStyle[r.kind];
            const Icon = style.icon;
            return (
              <tr key={r.id} className="transition hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${style.bg} ${style.text}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate font-medium">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">
                  {new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{r.by}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
