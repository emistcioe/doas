import { apiGet } from "@/lib/api/fetch";
import { API_PROJECT_PUBLIC_PREFIX } from "@/lib/env";
import type { Paginated } from "@/lib/types/department";
import type { Project, ProjectTag } from "@/lib/types/project";

const P = API_PROJECT_PUBLIC_PREFIX;

export function listProjects(params?: {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  department?: string | number;
  projectType?: string;
  status?: string;
  isFeatured?: boolean;
}) {
  return apiGet<Paginated<Project>>(`${P}/projects`, params);
}

export function listProjectsByDepartment(
  departmentSlug: string,
  params?: {
    limit?: number;
    offset?: number;
    ordering?: string;
    search?: string;
    tags?: string;
  }
) {
  return apiGet<Project[]>(`${P}/projects/by_department`, {
    department_slug: departmentSlug,
    ...params,
  });
}

export function listFeaturedProjects(params?: { limit?: number }) {
  return apiGet<Project[]>(`${P}/projects/featured`, params);
}

export function getProject(idOrSlug: string | number) {
  return apiGet<Project>(`${P}/projects/${idOrSlug}`);
}

export function listProjectTags() {
  return apiGet<ProjectTag[]>(`${P}/project-tags`);
}
