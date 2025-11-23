"use client"

import React, { createContext, useContext } from 'react'
import { useDepartment } from '@/hooks/use-department'

type Ctx = ReturnType<typeof useDepartment>

const DepartmentContext = createContext<Ctx | null>(null)

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const value = useDepartment()
  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>
}

export function useDepartmentContext() {
  const ctx = useContext(DepartmentContext)
  if (!ctx) {
    throw new Error('useDepartmentContext must be used within DepartmentProvider')
  }
  return ctx
}

