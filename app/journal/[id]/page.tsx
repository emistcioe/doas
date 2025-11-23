import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Link as LinkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departmentSlugFromCode } from "@/lib/department";
import {
  DEPARTMENT_CODE,
  API_JOURNAL_PUBLIC_PREFIX,
  getPublicApiUrl,
} from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";

type Article = {
  id: string;
  title: string;
  url_id?: string;
  genre?: string | null;
  date_published?: string | null;
  doi_id?: string | null;
  abstract?: string | null;
  keywords?: string | null;
  discipline?: string | null;
  department_name?: string | null;
  academic_program_name?: string | null;
  authors?: { given_name: string; family_name?: string }[];
  submission_id?: string | null;
  volume?: string | number | null;
  number?: string | number | null;
  year?: string | number | null;
  pages?: string | null;
};

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

async function fetchArticle(identifier: string): Promise<Article | null> {
  const attempts = [
    `${API_JOURNAL_PUBLIC_PREFIX}/articles/${identifier}`,
    `${API_JOURNAL_PUBLIC_PREFIX}/articles?url_id=${encodeURIComponent(
      identifier
    )}`,
  ];

  for (const endpoint of attempts) {
    try {
      const res = await fetch(getPublicApiUrl(endpoint), {
        headers: { Accept: "application/json" },
        next: { revalidate: 180 },
      });
      if (!res.ok) continue;
      const data = await res.json();

      if (Array.isArray(data?.results)) {
        const fromResults =
          data.results.find(
            (item: Article) =>
              item.id === identifier || item.url_id === identifier
          ) || data.results[0];
        if (fromResults) return fromResults;
      }

      if (data && typeof data === "object" && "id" in data) {
        return data as Article;
      }
    } catch (error) {
      console.warn("Failed to fetch journal article detail:", error);
    }
  }

  return null;
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const identifier = decodeURIComponent(id);
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for journal detail:", error);
  }

  const article = await fetchArticle(identifier);

  if (!article) {
    return notFound();
  }

  const keywordList =
    article.keywords
      ?.split(",")
      .map((kw) => kw.trim())
      .filter(Boolean) || [];

  return (
    <div className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to journal
        </Link>

        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            {deptShortName || deptName} journal
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {article.title}
            </h1>
            {article.abstract && (
              <p className="text-muted-foreground">{article.abstract}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {article.genre && <Badge variant="outline">{article.genre}</Badge>}
            {article.discipline && (
              <Badge variant="secondary">{article.discipline}</Badge>
            )}
            {article.date_published && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.date_published)}
              </span>
            )}
          </div>
        </header>

        <Card className="shadow-sm border-border/70">
          <CardHeader>
            <CardTitle>Publication details</CardTitle>
            <CardDescription>
              {article.keywords
                ? `Keywords: ${article.keywords}`
                : "Citation and authorship information."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {article.discipline && (
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                  Discipline
                </p>
                <p className="text-foreground">{article.discipline}</p>
              </div>
            )}

            {keywordList.length ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywordList.map((kw, idx) => (
                    <span
                      key={`${kw}-${idx}`}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground bg-white"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {article.authors?.length ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                  Authors
                </p>
                <p className="text-foreground">
                  {article.authors
                    .map((a) => `${a.given_name} ${a.family_name || ""}`.trim())
                    .join(", ")}
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  DOI
                </p>
                {article.doi_id ? (
                  <a
                    href={`https://doi.org/${article.doi_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {article.doi_id}
                    <LinkIcon className="h-4 w-4" />
                  </a>
                ) : (
                  <p className="text-foreground">Not provided</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Published on
                </p>
                <p className="text-foreground">
                  {article.date_published
                    ? formatDate(article.date_published)
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Department
                </p>
                <p className="text-foreground">
                  {article.department_name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Academic program
                </p>
                <p className="text-foreground">
                  {article.academic_program_name || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Submission ID
                </p>
                <p className="text-foreground">
                  {article.submission_id || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Volume / Issue
                </p>
                <p className="text-foreground">
                  {article.volume || article.number
                    ? `${article.volume || "—"} / ${article.number || "—"}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Publication year
                </p>
                <p className="text-foreground">{article.year || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  Pages
                </p>
                <p className="text-foreground">{article.pages || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
