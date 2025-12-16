import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import AuthWrapper from '@/components/AuthWrapper'

export const metadata: Metadata = {
  title: 'StackAdvisor Admin',
  description: 'Admin panel for StackAdvisor delivery app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-900 min-h-screen">
        <AuthWrapper>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </AuthWrapper>
      </body>
    </html>
  )
}
