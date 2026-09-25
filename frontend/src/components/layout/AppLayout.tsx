import { Link, Outlet, useLocation } from "react-router-dom"
import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Users as UsersIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/AuthContext"
import { NotificationsMenu } from "@/components/layout/NotificationsMenu"
import { ProfileMenu } from "@/components/layout/ProfileMenu"

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to)

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, visible: true },
    { to: "/subjects", label: "Subjects", icon: BookOpen, visible: true },
    { to: "/exams", label: "Exams", icon: CalendarDays, end: true, visible: true },
    { to: "/quizzes", label: "Quizzes", icon: BrainCircuit, end: true, visible: user?.type === "STUDENT" },
    { to: "/quizzes/scores", label: "My scores", icon: GraduationCap, visible: user?.type === "STUDENT" },
    { to: "/users", label: "Users", icon: UsersIcon, visible: user?.type === "ADMIN" },
  ].filter((item) => item.visible)

  return <>
    <div className="flex h-full flex-col overflow-hidden bg-background">
        <header className="z-30 flex h-[4.5rem] shrink-0 items-center gap-4 border-b border-border bg-white px-4 md:px-8">
          <Link to="/" className="mr-1 flex size-9 items-center justify-center text-primary md:hidden"><GraduationCap className="size-7" /></Link>
          <Link to="/" className="mr-2 hidden items-center gap-3 md:flex">
            <span className="flex size-10 items-center justify-center text-primary">
              <GraduationCap className="size-8" strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-[15px] font-semibold text-foreground">IMILearn</span>
              <span className="mt-0.5 text-xs text-muted-foreground">Study easily</span>
            </span>
          </Link>
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto sm:hidden">
            {navItems.map(({ to, label, end }) => <Link key={to} to={to} className={cn("rounded-md px-2 py-1.5 text-xs font-medium", isActive(to, end) ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NotificationsMenu />
            <ProfileMenu />
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden h-full w-[17rem] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar md:flex">
            <nav className="flex flex-1 flex-col gap-1.5 px-4 py-6">
              {navItems.map(({ to, label, icon: Icon, end }) => {
                const active = isActive(to, end)
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_1px_3px_rgb(16_24_40/7%)] [&_svg]:text-primary"
                        : "text-muted-foreground hover:bg-white/70 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto bg-background px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-[90rem]"><Outlet /></div>
          </main>
        </div>
    </div>
  </>
}
