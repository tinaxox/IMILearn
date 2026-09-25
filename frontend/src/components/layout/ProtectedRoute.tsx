import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import type { UserType } from "@/types/api"

export function ProtectedRoute({ allow }: { allow?: UserType[] }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allow && user && !allow.includes(user.type)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
