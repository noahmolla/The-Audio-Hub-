"use client"

import { useState, useEffect } from "react"
import ProfileInfoForm from "@/components/ProfileInfoForm"
import { API_HOST_BASE_URL } from "@/lib/constants"
import Link from "next/link"

interface User {
  user_name: string
  email: string
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1) Grab raw token
    const rawToken = localStorage.getItem("accessToken")
    // 2) If it's null, bail (or redirect)
    if (!rawToken) {
      setLoading(false)
      return
    }
    // 3) Now TS knows `token` is a string
    const token: string = rawToken

    async function fetchAccount(): Promise<void> {
      try {
        // build headers with a guaranteed string
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          token, // no more null!
        }

        // fetch user
        const userRes = await fetch(`${API_HOST_BASE_URL}/auth/user/`, { headers })
        if (!userRes.ok) throw new Error("Failed to load user")
        const u: User = await userRes.json()
        setUser(u)
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  if (loading) {
    return <p className="text-center p-4">Loading account…</p>
  }
  if (!user) {
    return <p className="text-center p-4 text-destructive">Not signed in.</p>
  }

  return (
    <main className="p-4 max-w-2xl mx-auto space-y-8">
      <ProfileInfoForm initialUsername={user.user_name} initialEmail={user.email} />
      <div className="text-center">
        <Link href="/forgot_password/verify-user" className="text-primary hover:underline text-sm">
          Forgot your password?
        </Link>
      </div>
    </main>
  )
}
