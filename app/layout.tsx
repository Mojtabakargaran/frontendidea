import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/hooks/use-user'
import { SharedQueryClientProvider } from '@/providers/query-client-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Samanin - Rental Management Platform',
  description: 'Professional rental management system for businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className="font-persian">
      <body className={`${inter.className} antialiased`}>
        <SharedQueryClientProvider>
          <UserProvider>
            <div id="__next" className="min-h-screen">{children}</div>
          </UserProvider>
        </SharedQueryClientProvider>
      </body>
    </html>
  )
}
