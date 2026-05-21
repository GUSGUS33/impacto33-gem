"use client"

import { MainLayout } from '@/layouts/MainLayout'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
