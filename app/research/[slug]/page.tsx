import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Eye,
  Users,
  ExternalLink,
  Sparkles,
} from "lucide-react";
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
import { getResearch } from "@/lib/data/publicResearch";
import type { Research } from "@/lib/types/research";
import { sanitizeHtml } from "@/lib/utils/sanitize";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return value;
  }
};

const titleize = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join(" ")
    : "";

const formatCurrency = (value?: number | null) => {
  if (!value) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}`;
  }
};

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

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const researchId = decodeURIComponent(rawSlug);
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
  } catch (error) {
    console.warn("Failed to load department for research detail:", error);
  }

  let research: Research | null = null;
  try {
    research = await getResearch(researchId);
  } catch (error) {
    console.warn("Failed to load research detail:", error);
  }

  if (!research) {
    return notFound();
  }

  // allow accessing extended backend fields that are not in the trimmed Research type
  const r: any = research as any;

  const fundingText =
    r.fundingAgency ||
    r.fundingAmount ||
    research.fundingAgency ||
    research.fundingAmount
      ? [
          r.fundingAgency || research.fundingAgency,
          r.fundingAmount
            ? formatCurrency(
                typeof r.fundingAmount === "string"
                  ? parseFloat(r.fundingAmount)
                  : r.fundingAmount
              )
            : typeof research.fundingAmount === "number"
            ? formatCurrency(research.fundingAmount)
            : null,
        ]
          .filter(Boolean)
          .join(" • ")
      : "Not specified";

  const durationText = research.startDate
    ? `${formatDate(research.startDate)}${
        research.endDate ? ` – ${formatDate(research.endDate)}` : ""
      }`
    : "Not provided";

  const piName =
    r.principalInvestigator || research.principalInvestigatorShort || "TBD";

  const keywords =
    r.keywords && typeof r.keywords === "string"
      ? r.keywords
          .split(",")
          .map((kw: string) => kw.trim())
          .filter(Boolean)
      : [];

  const participants: any[] = Array.isArray(r.participants)
    ? r.participants
    : [];

  const publications: any[] = Array.isArray(r.publications)
    ? r.publications
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/research"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to research
          </Link>
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-100 text-slate-700"
          >
            {research.departmentName || deptName}
          </Badge>
        </div>

        {r.thumbnail ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <img
              src={normalizeImageUrl(r.thumbnail)}
              alt={r.title || research.title}
              className="h-[360px] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="rounded-full">
              {titleize(research.researchType)}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-emerald-100 text-emerald-800"
            >
              {titleize(research.status)}
            </Badge>
            {research.startDate && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {durationText}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-foreground">
            {research.title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {research.abstract}
          </p>

          {research.categories?.length || keywords.length ? (
            <div className="flex flex-wrap gap-2">
              {research.categories?.map(
                (cat: {
                  id: string | number;
                  name: string;
                  color?: string | null;
                }) => (
                  <span
                    key={cat.id}
                    className="text-xs px-3 py-1 rounded-full border border-border bg-white"
                    style={
                      cat.color
                        ? { border: `1px solid ${cat.color}`, color: cat.color }
                        : {}
                    }
                  >
                    {cat.name}
                  </span>
                )
              )}
              {keywords.slice(0, 8).map((kw: string, idx: number) => (
                <span
                  key={`${kw}-${idx}`}
                  className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground"
                >
                  #{kw}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white px-4 py-3">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">
              Duration
            </p>
            <p className="text-sm font-medium text-foreground">
              {durationText}
            </p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">
              Funding
            </p>
            <p className="text-sm font-medium text-foreground">{fundingText}</p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">
              Visibility
            </p>
            <p className="text-sm font-medium text-foreground">
              {research.isPublished ? "Published" : "Draft"}
            </p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3">
            <p className="text-xs uppercase text-muted-foreground tracking-wide">
              Views
            </p>
            <p className="text-sm font-medium text-foreground">
              {r.viewsCount ?? research.viewsCount ?? 0}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4">
            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <CardTitle>Project overview</CardTitle>
                <CardDescription>
                  {r.abstract ||
                    research.abstract ||
                    "Details for this research will be available soon."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      r.description || r.abstract || research.abstract || ""
                    ),
                  }}
                />
              </CardContent>
            </Card>

            {r.methodology ? (
              <Card className="shadow-sm border-border/70">
                <CardHeader>
                  <CardTitle>Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(r.methodology),
                    }}
                  />
                </CardContent>
              </Card>
            ) : null}

            {r.expectedOutcomes ? (
              <Card className="shadow-sm border-border/70">
                <CardHeader>
                  <CardTitle>Expected outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(r.expectedOutcomes),
                    }}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <CardTitle>Principal investigator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold uppercase">
                    {piName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{piName}</p>
                    {r.piEmail ? (
                      <a
                        className="text-sm text-primary underline"
                        href={`mailto:${r.piEmail}`}
                      >
                        {r.piEmail}
                      </a>
                    ) : null}
                    {research.departmentName ? (
                      <p className="text-xs text-muted-foreground">
                        {research.departmentName}
                      </p>
                    ) : null}
                    {research.academicProgramName ? (
                      <p className="text-xs text-muted-foreground">
                        Program: {research.academicProgramName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border bg-white px-3 py-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Type
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {titleize(research.researchType) || "Unspecified"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white px-3 py-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Status
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {titleize(research.status) || "Unpublished"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <CardTitle>Team & reach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Participants
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {participants.length || research.participantsCount || 0}{" "}
                      people
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Visibility
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {research.isPublished ? "Published" : "Draft"} •{" "}
                      {r.viewsCount ?? research.viewsCount ?? 0} views
                    </p>
                  </div>
                </div>

                {participants.length ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Team
                    </p>
                    <ul className="space-y-2">
                      {participants.map((p: any) => (
                        <li
                          key={p.id}
                          className="rounded-lg border bg-white px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">
                                {p.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.role || p.participantType || "Researcher"}
                              </p>
                            </div>
                            {p.email ? (
                              <a
                                href={`mailto:${p.email}`}
                                className="text-xs text-primary underline"
                              >
                                {p.email}
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Team details will appear once participants are added.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/70">
              <CardHeader>
                <CardTitle>Resources & links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.projectUrl ? (
                  <div>
                    <a
                      href={r.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Project link
                    </a>
                  </div>
                ) : null}
                {r.githubUrl ? (
                  <div>
                    <a
                      href={r.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Code (GitHub)
                    </a>
                  </div>
                ) : null}
                {r.reportFile ? (
                  <div>
                    <a
                      href={r.reportFile}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Download report
                    </a>
                  </div>
                ) : null}

                {publications.length ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Publications
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {publications.map((p: any, i: number) => (
                        <li key={i}>
                          {p.title ? (
                            <a
                              href={p.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {p.title}
                            </a>
                          ) : (
                            p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                Link
                              </a>
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
