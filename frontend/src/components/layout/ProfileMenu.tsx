import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth/AuthContext"

export function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = `${user?.name?.[0] ?? ""}${user?.surname?.[0] ?? ""}`.toUpperCase()
  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto gap-2 px-1.5 py-1" aria-label="Open profile menu" />}>
      <Avatar size="lg"><AvatarFallback>{initials || "U"}</AvatarFallback></Avatar>
      <span className="hidden text-[13px] font-medium text-foreground lg:inline">{user?.name} {user?.surname}</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="text-sm font-semibold text-foreground">{user?.name} {user?.surname}</span>
          <span className="truncate font-normal text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>
        {user?.type === "STUDENT" && <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1.5 py-2 text-xs">
          <span className="text-muted-foreground">Index</span><span className="text-right font-medium">{user.index || "-"}</span>
          <span className="text-muted-foreground">Year</span><span className="text-right font-medium">{user.year ?? "-"}</span>
          <span className="text-muted-foreground">ESPB</span><span className="text-right font-medium">{user.espb ?? "-"}</span>
          <span className="text-muted-foreground">Score</span><span className="text-right font-medium">{user.score ?? "-"}</span>
        </div>}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
}
