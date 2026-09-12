import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LayoutDashboard, ListChecks, Shield, UserCircle2, LogOut, Bell, ArrowLeft, CalendarPlus, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import { users, exams, getUserSubjects } from "@/lib/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState, type ReactNode } from "react";

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 260;
const SIDEBAR_DEFAULT_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_COLLAPSE_THRESHOLD = 150;

function readStoredWidth(): number {
  if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;
  const saved = Number(window.localStorage.getItem("imilearn.sidebarWidth"));
  return saved >= SIDEBAR_MIN_WIDTH && saved <= SIDEBAR_MAX_WIDTH ? saved : SIDEBAR_DEFAULT_WIDTH;
}

function readStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("imilearn.sidebarCollapsed") === "1";
}

const AUTH_ROUTES = ["/login", "/register"];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, switchUser } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const [width, setWidth] = useState(readStoredWidth);
  const draggingRef = useRef(false);

  useEffect(() => {
    window.localStorage.setItem("imilearn.sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  useEffect(() => {
    window.localStorage.setItem("imilearn.sidebarWidth", String(width));
  }, [width]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      if (e.clientX < SIDEBAR_COLLAPSE_THRESHOLD) {
        setCollapsed(true);
        return;
      }
      setCollapsed(false);
      setWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX)));
    }
    function onUp() {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  if (!user || AUTH_ROUTES.includes(pathname)) return <>{children}</>;

  const isSubjectPage = pathname.startsWith("/subjects/");

  const nav = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard, show: true },
    { to: "/quiz", label: t("nav.quiz"), icon: ListChecks, show: user.role === "student" },
    { to: "/profile", label: t("nav.profile"), icon: UserCircle2, show: user.role === "student" },
    { to: "/admin", label: t("nav.admin"), icon: Shield, show: user.role === "admin" },
  ];

  const doLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  const mySubjects = getUserSubjects(user.id, user.role);
  const notifications = exams
    .filter((e) => mySubjects.some((s) => s.id === e.subjectId) && new Date(e.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
    .map((e) => {
      const s = mySubjects.find((x) => x.id === e.subjectId);
      const d = new Date(e.date);
      return {
        id: e.id,
        text: t("notifications_ns.newExam", { exam: e.name, subject: s?.name ?? "" }),
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
    });

  return (
    <div className="flex h-screen overflow-hidden white">
      <aside
        className="relative hidden h-full shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r bg-sidebar p-2 md:flex"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : width }}
      >
        <Link to="/" className="flex min-w-0 items-center gap-2 px-2 font-semibold">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgb(0,83,80)] to-[rgb(0,138,93)] text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          {!collapsed && <span className="truncate text-base leading-tight">IMILearn</span>}
        </Link>

        <nav className="mt-8 flex-1 space-y-1">
          {nav.filter((n) => n.show).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              title={collapsed ? n.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground ${collapsed ? "justify-center" : ""}`}
              activeProps={{ className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium border-[1.5px] border-foreground/70 text-foreground ${collapsed ? "justify-center" : ""}` }}
              activeOptions={{ exact: n.to === "/" }}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {!collapsed && n.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3">
          <button
            onClick={doLogout}
            title={collapsed ? t("common.logout") : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10 ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && t("common.logout")}
          </button>
        </div>

        <div
          onMouseDown={startDrag}
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-muted-foreground/20"
          title={t("common.dragToResize")}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-30 shrink-0 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex h-16 items-center gap-4">
            {isSubjectPage ? (
              <Link to="/" className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> {t("nav.dashboard")}
              </Link>
            ) : (
              <nav className="flex items-center gap-1 md:hidden">
                {nav.filter((n) => n.show).map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    activeProps={{ className: "rounded-md px-2.5 py-1.5 text-sm font-medium border-2 border-foreground/70 text-foreground" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    <n.icon className="h-4 w-4" />
                  </Link>
                ))}
              </nav>
            )}

            <div className="ml-auto flex items-center gap-3">
              <Select
                value={user.id}
                onValueChange={(v) => {
                  switchUser(v);
                  router.invalidate();
                }}
              >
                <SelectTrigger
                  className="hidden h-8 w-auto gap-1.5 rounded-full border-none bg-muted px-3 text-xs shadow-none focus:ring-1 focus:ring-ring md:flex"
                  title="Demo: switch user"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} — {t(`roles.${u.role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "sr")}>
                <SelectTrigger
                  className="h-8 w-auto gap-1.5 rounded-full border-none bg-muted px-3 text-xs shadow-none focus:ring-1 focus:ring-ring"
                  title={t("language.label")}
                  aria-label={t("language.label")}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="sr">SR</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground bg-muted hover:text-foreground" title={t("common.notifications")}>
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>{t("common.notifications")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">{t("common.noNewNotifications")}</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} className="items-start gap-2.5 whitespace-normal py-2">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgb(255,235,169)] text-[rgb(119,48,0)]">
                          <CalendarPlus className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm leading-snug">{n.text}</div>
                          <div className="text-xs text-muted-foreground">{n.date}</div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="hidden sm:block">
                <div className="text-sm font-medium leading-tight">{user.firstName} {user.lastName}</div>
                <div className="text-xs leading-tight text-muted-foreground">{user.email}</div>
              </div>

              <button
                onClick={doLogout}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
                title={t("common.signOut")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-5">{children}</main>
      </div>
    </div>
  );
}
