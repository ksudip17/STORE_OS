import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StoreOS — Smart Store Management',
  description: 'Track customer credit, manage stores, understand your business.',
  icons: {
    icon: '/icon',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}