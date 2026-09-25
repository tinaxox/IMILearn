import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { apiClient, getErrorMessage } from "@/lib/api-client"
import type { AssignmentSubmission, DownloadUrl } from "@/types/api"

export function FileDownload({ file }: { file: AssignmentSubmission["files"][number] }) {
  const download = async () => {
    try {
      const response = await apiClient.get<DownloadUrl>(`/assignments/submission-files/${file.id}/download-url`)
      window.open(response.data.url, "_blank")
    } catch (error) { toast.error(getErrorMessage(error)) }
  }
  return <Button type="button" variant="outline" size="sm" onClick={download}>Download</Button>
}
