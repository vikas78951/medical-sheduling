import { Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TanStackDevtoolsPanel } from "@/components/tanstack-devtool";
import { Toaster } from "@/components/ui/toast"
import StoreProvider from "./StoreProvider";
import AuthListener from "@/components/auth/auth-listener"
import Header from "@/components/header";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", outfit.variable)}
    >
      <body>
        <ThemeProvider>
          <StoreProvider>
             <AuthListener />
             <Header />
            {children}
          </StoreProvider>

          <Toaster />

        </ThemeProvider>
        <TanStackDevtoolsPanel />
      </body>
    </html>
  )
}
