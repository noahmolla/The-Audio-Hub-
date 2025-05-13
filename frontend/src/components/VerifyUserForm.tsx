"use client"

import { Button } from "./ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "./ui/form"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { API_HOST_BASE_URL } from "@/lib/constants"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { verifyUser } from "@/lib/auth"
import { toast } from "sonner"
import { LockKeyhole } from "lucide-react"

function VerifyUserForm() {
  const formSchema = z.object({
    user_name: z.string().min(8, { message: "Username must be at least 8 characters" }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
    const res = await verifyUser(values.user_name);
    if(res) {

      const response = await fetch(`${API_HOST_BASE_URL}/auth/forgot-password?username=${values.user_name}`, {
        method: 'POST',
      });
      
  
      if(response.status == 404) {
        throw Error("User not found")
      }
      if (response.ok) {
        localStorage.setItem("user_name", values.user_name)
        setTimeout(() => {
          window.location.href = '/forgot_password/update-password';
        }, 2000);
        return true;
      }
    }
    else {
    throw new Error('Invalid Credentials');
    }
    }
    catch(err: any) {
      toast.error(err.message ?? "Error!!")
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
        <CardDescription className="text-center">Step 1 of 3: Verify your username</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} className="h-10" />
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
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}

export default VerifyUserForm
