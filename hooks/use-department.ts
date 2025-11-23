"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEPARTMENT_CODE } from '@/lib/env'
import { departmentSlugFromCode } from '@/lib/department'
import * as data from '@/lib/data/publicDepartment'
import type {
  DepartmentDetail,
  DepartmentDownload,
  DepartmentEvent,
  DepartmentPlan,
  DepartmentProgram,
  DepartmentStaff,
  EventGalleryItem,
  Paginated,
} from '@/lib/types/department'
import type { PaginatedNotices } from '@/lib/types/notice'
import * as noticeData from '@/lib/data/publicNotice'

function useAsyncState<T>(initial?: T) {
  const [dataState, setData] = useState<T | undefined>(initial)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  return { data: dataState, setData, loading, setLoading, error, setError }
}

export function useDepartmentSlug(code?: string) {
  return useMemo(() => {
    const c = (code || DEPARTMENT_CODE || '').toLowerCase()
    return departmentSlugFromCode(c)
  }, [code])
}

export function useDepartment(opts?: { code?: string; slug?: string }) {
  const slug = opts?.slug || useDepartmentSlug(opts?.code)
  const s = useAsyncState<DepartmentDetail>()

  const load = useCallback(async () => {
    if (!slug) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.getDepartment(slug)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  return { ...s, slug, reload: load }
}

export function useDepartmentEvents(params?: {
  limit?: number
  offset?: number
  ordering?: string
  search?: string
  departmentUuid?: string
  slug?: string
}) {
  const slug = params?.slug || useDepartmentSlug(undefined)
  const [deptUuid, setDeptUuid] = useState<string | undefined>(params?.departmentUuid)
  const s = useAsyncState<Paginated<DepartmentEvent>>()
  const load = useCallback(async () => {
    const department = params?.departmentUuid || deptUuid
    if (!department) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listDepartmentEvents(department, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [JSON.stringify(params || {}), deptUuid])
  useEffect(() => void load(), [load])
  // load department uuid if not provided
  useEffect(() => {
    let ignore = false
    async function loadUuid() {
      if (params?.departmentUuid || !slug) return
      try {
        const d = await data.getDepartment(slug)
        if (!ignore) setDeptUuid(d.uuid)
      } catch {
        // ignore
      }
    }
    void loadUuid()
    return () => {
      ignore = true
    }
  }, [slug, params?.departmentUuid])
  return { ...s, slug, reload: load, departmentUuid: deptUuid || params?.departmentUuid }
}

export function useDepartmentDownloads(params?: { limit?: number; offset?: number; slug?: string }) {
  const slug = params?.slug || useDepartmentSlug(undefined)
  const s = useAsyncState<Paginated<DepartmentDownload>>()
  const load = useCallback(async () => {
    if (!slug) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listDepartmentDownloads(slug, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [slug, JSON.stringify(params || {})])
  useEffect(() => void load(), [load])
  return { ...s, slug, reload: load }
}

export function useDepartmentPlans(params?: { limit?: number; offset?: number; slug?: string }) {
  const slug = params?.slug || useDepartmentSlug(undefined)
  const s = useAsyncState<Paginated<DepartmentPlan>>()
  const load = useCallback(async () => {
    if (!slug) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listDepartmentPlans(slug, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [slug, JSON.stringify(params || {})])
  useEffect(() => void load(), [load])
  return { ...s, slug, reload: load }
}

export function useDepartmentPrograms(params?: { limit?: number; offset?: number; ordering?: string; search?: string; slug?: string }) {
  const slug = params?.slug || useDepartmentSlug(undefined)
  const s = useAsyncState<Paginated<DepartmentProgram>>()
  const load = useCallback(async () => {
    if (!slug) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listDepartmentPrograms(slug, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [slug, JSON.stringify(params || {})])
  useEffect(() => void load(), [load])
  return { ...s, slug, reload: load }
}

export function useDepartmentStaffs(params?: { limit?: number; offset?: number; ordering?: string; search?: string; slug?: string }) {
  const slug = params?.slug || useDepartmentSlug(undefined)
  const s = useAsyncState<Paginated<DepartmentStaff>>()
  const load = useCallback(async () => {
    if (!slug) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listDepartmentStaffs(slug, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [slug, JSON.stringify(params || {})])
  useEffect(() => void load(), [load])
  return { ...s, slug, reload: load }
}

export function useEventGallery(eventId?: number, params?: { limit?: number; offset?: number }) {
  const s = useAsyncState<Paginated<EventGalleryItem>>()
  const load = useCallback(async () => {
    if (!eventId) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await data.listEventGallery(eventId, params)
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [eventId, JSON.stringify(params || {})])
  useEffect(() => void load(), [load])
  return { ...s, reload: load }
}

export function useDepartmentNotices(params?: {
  limit?: number
  offset?: number
  ordering?: string
  search?: string
  departmentUuid?: string
}) {
  const slug = useDepartmentSlug(undefined)
  const [deptUuid, setDeptUuid] = useState<string | undefined>(params?.departmentUuid)
  // If not provided, try to load department to get uuid
  useEffect(() => {
    let ignore = false
    async function loadUuid() {
      if (params?.departmentUuid || !slug) return
      try {
        const d = await data.getDepartment(slug)
        if (!ignore) setDeptUuid(d.uuid)
      } catch {
        // ignore
      }
    }
    void loadUuid()
    return () => {
      ignore = true
    }
  }, [slug, params?.departmentUuid])

  const s = useAsyncState<PaginatedNotices>()
  const load = useCallback(async () => {
    const dep = params?.departmentUuid || deptUuid
    if (!dep) return
    s.setLoading(true)
    s.setError(null)
    try {
      const res = await noticeData.listNotices({ ...params, department: dep })
      s.setData(res)
    } catch (e: any) {
      s.setError(e)
    } finally {
      s.setLoading(false)
    }
  }, [JSON.stringify(params || {}), deptUuid])
  useEffect(() => void load(), [load])
  return { ...s, reload: load, departmentUuid: deptUuid || params?.departmentUuid }
}
