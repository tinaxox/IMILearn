import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function FileUploader({
  accept = ".pdf,.ppt,.pptx",
  label,
  onFile,
}: {
  accept?: string;
  label?: string;
  onFile?: (name: string) => void;
}) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("file.uploadFile");
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setName(f.name);
            onFile?.(f.name);
          }
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>
        <Upload className="mr-1.5 h-4 w-4" />
        {resolvedLabel}
      </Button>
      {name && <span className="text-xs text-muted-foreground">{name}</span>}
    </div>
  );
}
