import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE, API_JOURNAL_PUBLIC_PREFIX, getPublicApiUrl } from "@/lib/env";
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
  authors?: { given_name: string; family_name?: string }[];
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

export default async function JournalPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for journal:", error);
  }

  let articles: Article[] = [];
  let errorMessage: string | null = null;

  if (slug) {
    try {
      const params = new URLSearchParams({
        department_slug: slug,
        ordering: "-date_published",
        limit: "30",
      });
      const res = await fetch(
        getPublicApiUrl(`${API_JOURNAL_PUBLIC_PREFIX}/articles?${params.toString()}`),
        { headers: { Accept: "application/json" }, next: { revalidate: 180 } }
      );
      if (!res.ok) {
        throw new Error(`Failed to load journal (${res.status})`);
      }
      const data = await res.json();
      articles = Array.isArray(data?.results) ? data.results : data || [];
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Unable to load journal articles.";
    }
  } else {
    errorMessage = "Department code is not configured.";
  }

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            Department Journal
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {deptName} journal articles
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover published work and citations curated by{" "}
            {deptShortName || deptName}.
          </p>
        </header>

        {errorMessage && (
          <p className="text-sm text-red-600 text-center">{errorMessage}</p>
        )}

        {!errorMessage && articles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Journal articles will appear here once they are published for this department.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/journal/${article.url_id || article.id}`}
              className="block h-full transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Card className="h-full shadow-sm border-border/70">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {article.genre && <Badge variant="outline">{article.genre}</Badge>}
                    {article.discipline && (
                      <Badge variant="secondary">{article.discipline}</Badge>
                    )}
                    {article.date_published && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.date_published)}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    {article.title}
                  </CardTitle>
                  {article.abstract && (
                    <CardDescription className="line-clamp-3">
                      {article.abstract}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {article.doi_id && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>DOI: {article.doi_id}</span>
                    </div>
                  )}
                  {article.authors?.length ? (
                    <div>
                      <span className="font-semibold text-foreground">Authors: </span>
                      {article.authors
                        .map((a) => `${a.given_name} ${a.family_name || ""}`.trim())
                        .join(", ")}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
