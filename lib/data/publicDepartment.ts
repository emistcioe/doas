import {
  getDepartment as apiLocalGetDepartment,
  listDepartmentDownloads as apiListDepartmentDownloads,
  listDepartmentEvents as apiListDepartmentEvents,
  listDepartmentPlans as apiListDepartmentPlans,
  listDepartmentPrograms as apiListDepartmentPrograms,
  listDepartmentStaffs as apiListDepartmentStaffs,
  listEventGallery as apiListEventGallery,
} from "@/lib/api/department";
import {
  listDepartments as apiListDepartments,
  getDepartment as apiPublicGetDepartment,
  listDepartmentDownloads as apiPublicListDepartmentDownloads,
  listDepartmentEvents as apiPublicListDepartmentEvents,
  listDepartmentPlans as apiPublicListDepartmentPlans,
  listDepartmentPrograms as apiPublicListDepartmentPrograms,
  listDepartmentStaffs as apiPublicListDepartmentStaffs,
  listEventGallery as apiPublicListEventGallery,
} from "@/lib/api/publicDepartment";
import type {
  DepartmentDetail,
  DepartmentDownload,
  DepartmentEvent,
  DepartmentPlan,
  DepartmentProgram,
  DepartmentStaff,
  DepartmentSummary,
  EventGalleryItem,
  Paginated,
} from "@/lib/types/department";

export function listDepartments(params?: {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
}): Promise<Paginated<DepartmentSummary>> {
  return apiListDepartments(params);
}

export function getDepartment(slug: string): Promise<DepartmentDetail> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined") return apiPublicGetDepartment(slug);
  return apiLocalGetDepartment(slug);
}

export function listDepartmentDownloads(
  slug: string,
  params?: { limit?: number; offset?: number }
): Promise<Paginated<DepartmentDownload>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListDepartmentDownloads(slug, params);
  return apiListDepartmentDownloads(slug, params);
}

export function listDepartmentEvents(
  departmentUuid: string,
  params?: {
    limit?: number;
    offset?: number;
    ordering?: string;
  }
): Promise<Paginated<DepartmentEvent>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListDepartmentEvents(departmentUuid, params);
  return apiListDepartmentEvents(departmentUuid, params);
}

export function listDepartmentPlans(
  slug: string,
  params?: { limit?: number; offset?: number }
): Promise<Paginated<DepartmentPlan>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListDepartmentPlans(slug, params);
  return apiListDepartmentPlans(slug, params);
}

export function listDepartmentPrograms(
  slug: string,
  params?: {
    limit?: number;
    offset?: number;
    ordering?: string;
    search?: string;
  }
): Promise<Paginated<DepartmentProgram>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListDepartmentPrograms(slug, params);
  return apiListDepartmentPrograms(slug, params);
}

export function listDepartmentStaffs(
  slug: string,
  params?: {
    limit?: number;
    offset?: number;
    ordering?: string;
    search?: string;
  }
): Promise<Paginated<DepartmentStaff>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListDepartmentStaffs(slug, params);
  return apiListDepartmentStaffs(slug, params);
}

export function listEventGallery(
  eventId: number,
  params?: { limit?: number; offset?: number }
): Promise<Paginated<EventGalleryItem>> {
  // Server: use absolute public API; Client: use local API route (CORS-safe)
  if (typeof window === "undefined")
    return apiPublicListEventGallery(eventId, params);
  return apiListEventGallery(eventId, params);
}
