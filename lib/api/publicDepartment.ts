import { apiGet } from "@/lib/api/fetch";
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
import {
  API_PUBLIC_PREFIX,
  API_WEBSITE_PUBLIC_PREFIX,
} from "@/lib/env";

const P = API_PUBLIC_PREFIX;

export function listDepartments(params?: { limit?: number; offset?: number; ordering?: string; search?: string }) {
  return apiGet<Paginated<DepartmentSummary>>(`${P}/departments`, params);
}

export function getDepartment(slug: string) {
  return apiGet<DepartmentDetail>(`${P}/departments/${slug}`);
}

export function listDepartmentDownloads(slug: string, params?: { limit?: number; offset?: number }) {
  return apiGet<Paginated<DepartmentDownload>>(
    `${P}/departments/${slug}/downloads`,
    params
  );
}

export function listDepartmentEvents(departmentUuid: string, params?: { limit?: number; offset?: number; ordering?: string }) {
  return apiGet<Paginated<DepartmentEvent>>(`${API_WEBSITE_PUBLIC_PREFIX}/global-events`, {
    department: departmentUuid,
    ...params,
  });
}

export function listDepartmentPlans(slug: string, params?: { limit?: number; offset?: number }) {
  return apiGet<Paginated<DepartmentPlan>>(
    `${P}/departments/${slug}/plans`,
    params
  );
}

export function listDepartmentPrograms(
  slug: string,
  params?: { limit?: number; offset?: number; ordering?: string; search?: string },
) {
  return apiGet<Paginated<DepartmentProgram>>(
    `${P}/departments/${slug}/programs`,
    params
  );
}

export function listDepartmentStaffs(
  slug: string,
  params?: { limit?: number; offset?: number; ordering?: string; search?: string },
) {
  return apiGet<Paginated<DepartmentStaff>>(
    `${P}/departments/${slug}/staffs`,
    params
  );
}

export function listEventGallery(eventId: number, params?: { limit?: number; offset?: number }) {
  return apiGet<Paginated<EventGalleryItem>>(
    `${P}/departments/events/${eventId}/gallery`,
    params
  );
}
