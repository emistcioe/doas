import type { Paginated } from "@/lib/types/department";
import type { Project } from "@/lib/types/project";
import {
  listFeaturedProjects as apiListFeaturedProjects,
  listProjects as apiListProjects,
  listProjectsByDepartment as apiListProjectsByDepartment,
  listProjectTags as apiListProjectTags,
  getProject as apiGetProject,
} from "@/lib/api/publicProject";

export function listProjects(
  params?: Parameters<typeof apiListProjects>[0]
): Promise<Paginated<Project>> {
  return apiListProjects(params);
}

export function listProjectsByDepartment(
  slug: string,
  params?: Parameters<typeof apiListProjectsByDepartment>[1]
): Promise<Project[]> {
  return apiListProjectsByDepartment(slug, params);
}

export function listFeaturedProjects(
  params?: Parameters<typeof apiListFeaturedProjects>[0]
): Promise<Project[]> {
  return apiListFeaturedProjects(params);
}

export function getProject(idOrSlug: string | number): Promise<Project> {
  return apiGetProject(idOrSlug);
}

export function listProjectTags() {
  return apiListProjectTags();
}
