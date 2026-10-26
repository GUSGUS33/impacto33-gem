"use client"

import { MainLayout } from '@/layouts/MainLayout'
import { QuoteProductProvider } from '@/contexts/QuoteProductContext'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <QuoteProductProvider><MainLayout>{children}</MainLayout></QuoteProductProvider>
}
