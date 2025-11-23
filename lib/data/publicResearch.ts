import type { Paginated } from "@/lib/types/department";
import type { Research } from "@/lib/types/research";
import {
  listFeaturedResearch as apiListFeaturedResearch,
  listResearch as apiListResearch,
  listResearchByDepartment as apiListResearchByDepartment,
  getResearch as apiGetResearch,
  listResearchCategories as apiListResearchCategories,
} from "@/lib/api/publicResearch";

export function listResearch(
  params?: Parameters<typeof apiListResearch>[0]
): Promise<Paginated<Research>> {
  return apiListResearch(params);
}

export function listResearchByDepartment(
  slug: string,
  params?: Parameters<typeof apiListResearchByDepartment>[1]
): Promise<Research[]> {
  return apiListResearchByDepartment(slug, params);
}

export function listFeaturedResearch(
  params?: Parameters<typeof apiListFeaturedResearch>[0]
): Promise<Research[]> {
  return apiListFeaturedResearch(params);
}

export function getResearch(
  idOrSlug: string | number
): Promise<Research> {
  return apiGetResearch(idOrSlug);
}

export function listResearchCategories() {
  return apiListResearchCategories();
}
