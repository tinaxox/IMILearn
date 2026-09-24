import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient, getStoredAuth, setStoredAuth } from "@/lib/api-client"
import type { StoredAuth } from "@/lib/api-client"
import type { AuthResponse, CurrentUserResponse, LoginRequest, UserType } from "@/types/api"
import { disconnectStompClient } from "@/lib/ws-client"

interface AuthUser {
  id: number
  email: string
  name: string
  surname: string
  type: UserType
  espb: number | null
  score: number | null
  year: number | null
  index: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const currentUserQueryKey = ["auth", "me"] as const

function toAuthUser(auth: AuthResponse | StoredAuth): AuthUser {
  return {
    id: auth.id,
    email: auth.email,
    name: auth.name,
    surname: auth.surname,
    type: auth.type,
    espb: auth.espb ?? null,
    score: auth.score ?? null,
    year: auth.year ?? null,
    index: auth.index ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [initialAuth] = useState(() => getStoredAuth())
  const [token, setToken] = useState<string | null>(initialAuth?.token ?? null)

  const { data: user = null } = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<CurrentUserResponse>("/auth/me")
      return data
    },
    enabled: token !== null,
    initialData: initialAuth ? toAuthUser(initialAuth) : undefined,
    refetchOnWindowFocus: true,
    retry: false,
  })

  useEffect(() => {
    if (user) {
      const stored = getStoredAuth()
      if (stored?.token) setStoredAuth({ ...stored, ...user })
    }
  }, [user])

  const login = async (request: LoginRequest) => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", request)
    setStoredAuth(data)
    setToken(data.token)
    queryClient.setQueryData(currentUserQueryKey, toAuthUser(data))
  }

  const logout = () => {
    disconnectStompClient()
    setStoredAuth(null)
    setToken(null)
    queryClient.removeQueries({ queryKey: ["auth"] })
  }

  const value = { user, isAuthenticated: token !== null && user !== null, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
