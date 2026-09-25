import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function BackButton({ label = "Back" }: { label?: string }) {
  const navigate = useNavigate()
  return <Button type="button" variant="ghost" size="sm" className="-mt-3 -ml-2 w-fit text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}><ArrowLeft />{label}</Button>
}
