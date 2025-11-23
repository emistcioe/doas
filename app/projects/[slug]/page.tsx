import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Layers, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE, getPublicApiUrl } from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";
import { getProject } from "@/lib/data/publicProject";
import type { Project } from "@/lib/types/project";

const titleize = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ")
    : "";

const normalizeImageUrl = (image?: string | null) => {
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
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: paramSlug } = await params;
  const identifier = decodeURIComponent(paramSlug);
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
  } catch (error) {
    console.warn("Failed to load department for project detail:", error);
  }

  let project: Project | null = null;
  try {
    project = await getProject(identifier);
  } catch (error) {
    console.warn("Failed to load project detail:", error);
  }

  if (!project) {
    return notFound();
  }

  return (
    <div className="py-16 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>

        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            {deptName} projects & showcases
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {project.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {project.abstract}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{titleize(project.projectType)}</Badge>
            <Badge variant="outline">{titleize(project.status)}</Badge>
            {project.academicYear && (
              <span className="inline-flex items-center gap-1">
                <Layers className="h-4 w-4" />
                {project.academicYear}
              </span>
            )}
            {project.departmentName && (
              <Badge variant="outline">{project.departmentName}</Badge>
            )}
          </div>
          {project.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
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
          ) : null}
        </header>

        {project.thumbnail && (
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img
              src={normalizeImageUrl(project.thumbnail)}
              alt={project.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-sm border-border/70">
            <CardHeader>
              <CardTitle>Project overview</CardTitle>
              <CardDescription>
                {project.description ||
                  project.abstract ||
                  "Details will be added soon."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    Academic year
                  </p>
                  <p>{project.academicYear || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    Supervisor & team
                  </p>
                  <p>
                    {project.supervisorName || "Supervisor TBD"}
                    {project.membersCount
                      ? ` • ${project.membersCount} members`
                      : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/70">
            <CardHeader>
              <CardTitle>Links & resources</CardTitle>
              <CardDescription>
                Access live demos or repositories for this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live demo
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No demo link provided.
                </p>
              )}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Source repository
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No source link provided.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
