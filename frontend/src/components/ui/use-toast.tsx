// components/ui/use-toast.tsx
"use client"

import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner"

// No need to import a type—just forward the function
export function useToast() {
  return { toast: sonnerToast }
}

// Re-export the Toaster container for your layout
export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return <SonnerToaster {...props} />
}
