import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Citizen Pulse - Community Response Platform",
  description: "A community response website for posting and viewing issues affecting different constituencies",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
