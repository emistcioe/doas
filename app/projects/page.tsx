import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE, getPublicApiUrl } from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";
import { listProjectsByDepartment, listProjectTags } from "@/lib/data/publicProject";
import type { Project, ProjectTag } from "@/lib/types/project";

const titleize = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ")
    : "";

// Normalize image URL similar to gallery page:
// - If absolute and points to localhost, replace origin with API_BASE via getPublicApiUrl
// - If absolute and not localhost, keep as-is
// - If relative (starts with / or no protocol), prefix with API_BASE via getPublicApiUrl
function normalizeImageUrl(image?: string | null) {
  if (!image) return "";
  try {
    const parsed = new URL(image);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return getPublicApiUrl(parsed.pathname + parsed.search + parsed.hash);
    }
    return parsed.toString();
  } catch (e) {
    return getPublicApiUrl(image.startsWith("/") ? image : `/${image}`);
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; page?: string; tags?: string | string[] };
}) {
  const searchQuery = Array.isArray(searchParams?.q)
    ? searchParams?.q.join(" ")
    : searchParams?.q
    ? searchParams.q.toString()
    : "";
  const rawTags = searchParams?.tags;
  const selectedTags = Array.isArray(rawTags)
    ? rawTags.flatMap((tag) => tag.split(",")).filter(Boolean)
    : rawTags
    ? rawTags.split(",").filter(Boolean)
    : [];

  const page = Number(searchParams?.page || 1);
  const limit = 20;
  const offset = page > 1 ? (page - 1) * limit : 0;
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for projects:", error);
  }

  let projects: Project[] = [];
  let projectsError: string | null = null;
  let tags: ProjectTag[] = [];

  if (slug) {
    try {
      tags = await listProjectTags();
      projects = await listProjectsByDepartment(slug, {
        ordering: "-created_at",
        limit,
        offset,
        search: searchQuery || undefined,
        tags: selectedTags.length ? selectedTags.join(",") : undefined,
      });
    } catch (error) {
      projectsError =
        error instanceof Error
          ? error.message
          : "Unable to load projects right now.";
    }
  } else {
    projectsError = "Department code is not configured.";
  }

  const ProjectCard = ({ item }: { item: Project }) => (
    <Card className="h-full shadow-sm border-border/70">
      <div className="aspect-video w-full bg-muted overflow-hidden">
        <Link href={`/projects/${item.slug || item.id}`} className="block h-full">
          {item.thumbnail && (
            <img
              src={normalizeImageUrl(item.thumbnail)}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          )}
        </Link>
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{titleize(item.projectType)}</Badge>
          <Badge variant="outline">{titleize(item.status)}</Badge>
          {item.academicYear && (
            <span className="inline-flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {item.academicYear}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Link
            href={`/projects/${item.slug || item.id}`}
            className="block space-y-1 hover:text-primary"
          >
            <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {item.abstract}
            </CardDescription>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 rounded-full bg-muted"
              style={
                tag.color
                  ? { border: `1px solid ${tag.color}`, color: tag.color }
                  : {}
              }
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Supervisor: </span>
          {item.supervisorName || "N/A"}
          {item.membersCount ? ` • ${item.membersCount} members` : ""}
        </div>
        <div>
          <Link
            href={`/projects/${item.slug || item.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      {item.demoUrl || item.githubUrl ? (
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap text-sm text-muted-foreground">
            {item.demoUrl && (
              <a
                href={item.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Live demo
              </a>
            )}
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            Department Projects
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {deptName} projects & showcases
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore student and faculty-led projects from{" "}
            {deptShortName || deptName}, including capstone work, prototypes,
            and research builds.
          </p>
        </header>

        <section className="space-y-6">
          <form className="space-y-3" action="/projects">
            <div className="grid gap-3 md:grid-cols-[1fr,auto]">
              <input type="hidden" name="page" value="1" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search projects by title, abstract, or tech"
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Search
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isChecked = selectedTags.includes(tag.slug || `${tag.id}`);
                  return (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs cursor-pointer ${
                        isChecked ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="tags"
                        value={tag.slug || tag.id}
                        defaultChecked={isChecked}
                        className="hidden"
                      />
                      <span>{tag.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </form>

          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              Showing results filtered by: <span className="font-medium text-foreground">{searchQuery}</span>
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Projects</h2>
              <p className="text-sm text-muted-foreground">
                Published projects filtered for this department.
              </p>
            </div>
          </div>

          {projectsError && (
            <p className="text-sm text-red-600">{projectsError}</p>
          )}

          {projects.length === 0 && !projectsError ? (
            <p className="text-sm text-muted-foreground">No projects found.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
