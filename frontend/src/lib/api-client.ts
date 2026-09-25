import axios from "axios"
import type { ApiErrorBody } from "@/types/api"

export const TOKEN_STORAGE_KEY = "imilearn.auth"

export interface StoredAuth {
  id: number
  token: string
  email: string
  name: string
  surname: string
  type: "STUDENT" | "PROFESSOR" | "ADMIN"
  espb?: number | null
  score?: number | null
  year?: number | null
  index?: string | null
}

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth | null) {
  if (auth) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(auth))
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export const apiClient = axios.create({
  baseURL: "/api",
})

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredAuth(null)
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return "Something went wrong"
}
