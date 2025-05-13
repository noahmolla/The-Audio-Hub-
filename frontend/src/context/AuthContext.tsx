'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

import { getToken, setToken, clearToken } from "@/lib/auth"
import { redirect } from "next/navigation";

interface AuthContextType {
  token: string | null
  login: (jwt: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, _setToken] = useState<string | null>(null)

  // On first mount, load any existing token from localStorage
  useEffect(() => {
    const t = getToken()
    if (t) _setToken(t)
  }, [])

  // Called when the user logs in
  const login = (jwt: string) => {
    setToken(jwt)    // Persist in localStorage
    _setToken(jwt)   // Update React state → re-render subscribers
  }

  // Called when the user logs out
  const logout = () => {
    clearToken()     // Remove from localStorage
    _setToken(null)  // Clear React state
    redirect("/")
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}