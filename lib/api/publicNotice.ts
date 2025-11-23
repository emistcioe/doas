import { apiGet } from '@/lib/api/fetch'
import { API_NOTICE_PUBLIC_PREFIX } from '@/lib/env'
import type { PaginatedNotices } from '@/lib/types/notice'

const P = API_NOTICE_PUBLIC_PREFIX

export function listNotices(params?: {
  limit?: number
  offset?: number
  ordering?: string
  search?: string
  department?: string
  category?: string
}) {
  return apiGet<PaginatedNotices>(`${P}/notices`, params)
}

