"use client";

import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

// Export the toast function directly
export const toast = sonnerToast;

// Provide a hook for consistency
export function useToast() {
  return { toast };
}

// Re-export the Toaster container for your layout
export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return <SonnerToaster {...props} />;
}
