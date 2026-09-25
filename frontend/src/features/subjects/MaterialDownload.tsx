import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { DownloadUrl, Material } from "@/types/api"

export function MaterialDownload({ material }: { material: Material }) {
  const download = async () => {
    try {
      const response = await apiClient.get<DownloadUrl>(`/materials/${material.id}/download-url`)
      window.open(response.data.url, "_blank")
    } catch (error) { toast.error(getErrorMessage(error)) }
  }
  return <Button type="button" variant="outline" size="sm" onClick={download}>View</Button>
}
