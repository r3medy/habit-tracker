"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react"

function Toaster({ ...props }: React.ComponentProps<typeof Sonner>) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as React.ComponentProps<typeof Sonner>["theme"]}
      icons={{
        success: <CheckCircle className="size-5" />,
        info: <Info className="size-5" />,
        warning: <AlertTriangle className="size-5" />,
        error: <XCircle className="size-5" />,
        loading: <Loader2 className="size-5" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
