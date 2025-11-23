import { listNotices as apiListNotices } from '@/lib/api/publicNotice'
import type { PaginatedNotices } from '@/lib/types/notice'

export function listNotices(params?: {
  limit?: number
  offset?: number
  ordering?: string
  search?: string
  department?: string
  category?: string
}): Promise<PaginatedNotices> {
  return apiListNotices(params)
}
