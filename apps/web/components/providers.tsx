"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClientProvider } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/queries/queryClient"

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is created only once per component instance
  const [queryClient] = React.useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </QueryClientProvider>
  )
}
