"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "./ui/form"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { API_HOST_BASE_URL } from "@/lib/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { LockKeyhole } from "lucide-react"
import { toast } from "sonner"

function ChangePasswordForm() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("user_name") ?? ""
    setUserName(name)
  }, [])

  const formSchema = z
    .object({
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      confirm_password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      verification_code: z.string()
      .min(6, { message: "Verification Code must be 6 characters" })
      .max(6, { message: "Verification Code must be 6 characters" }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verification_code: "",
      password: "",
      confirm_password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      username: userName,
      verification_code: values.verification_code,
      new_password: values.password
    }
    try {
      console.log("Data to be sent:", data)
      const response = await fetch(`${API_HOST_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success("Password changed successfully! Redirecting...")
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
        return true
      }
      throw new Error("Failed to update password")
    } catch (error: any) {
      toast.error(error.message || "Password update failed")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">Step 3 of 3: Create new password</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
              control={form.control}
              name="verification_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 6-digit code" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>
          Change Password
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ChangePasswordForm
