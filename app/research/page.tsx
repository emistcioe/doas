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
import { DEPARTMENT_CODE, getPublicApiUrl } from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";
import { listResearchByDepartment, listResearchCategories } from "@/lib/data/publicResearch";
import type { Research, ResearchCategory } from "@/lib/types/research";

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
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
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

// Keep thumbnails working when the API returns relative or localhost URLs
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

function ResearchCard({ item }: { item: Research }) {
  const href = `/research/${item.slug ?? item.id}`;
  return (
    <Link
      href={href}
      className="block h-full transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Card className="h-full shadow-sm border-border/70">
        <div className="aspect-video w-full bg-muted overflow-hidden">
          {item.thumbnail && (
            <img
              src={normalizeImageUrl(item.thumbnail)}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{titleize(item.researchType)}</Badge>
            <Badge variant="outline">{titleize(item.status)}</Badge>
            {item.startDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(item.startDate)}
                {item.endDate ? ` – ${formatDate(item.endDate)}` : ""}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {item.abstract}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs px-2 py-1 rounded-full bg-muted"
                style={
                  cat.color ? { border: `1px solid ${cat.color}`, color: cat.color } : {}
                }
              >
                {cat.name}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">PI: </span>
            {item.principalInvestigatorShort || "TBD"}
            {item.fundingAgency && (
              <>
                {" • "}
                <span className="text-foreground">Funding:</span> {item.fundingAgency}
              </>
            )}
            {item.fundingAmount && <> ({formatCurrency(item.fundingAmount)})</>}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default async function ResearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[]; offset?: string; page?: string; categories?: string | string[] };
}) {
  const searchQuery = Array.isArray(searchParams?.q)
    ? searchParams?.q.join(" ")
    : searchParams?.q
    ? searchParams.q.toString()
    : "";

  const rawCategories = searchParams?.categories;
  const selectedCategories = Array.isArray(rawCategories)
    ? rawCategories.flatMap((item) => item.split(",")).filter(Boolean)
    : rawCategories
    ? rawCategories.split(",").filter(Boolean)
    : [];

  const page = Number(searchParams?.page || 1);
  const limit = 20;
  const offset = page > 1 ? (page - 1) * limit : 0;
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let categories: ResearchCategory[] = [];

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for research/projects:", error);
  }

  let research: Research[] = [];
  let researchError: string | null = null;

  if (slug) {
    try {
      categories = await listResearchCategories();
      research = await listResearchByDepartment(slug, {
        ordering: "-start_date",
        limit,
        offset,
        search: searchQuery || undefined,
        categories: selectedCategories.length ? selectedCategories.join(",") : undefined,
      });
    } catch (error) {
      researchError =
        error instanceof Error
          ? error.message
          : "Unable to load research items right now.";
    }

  } else {
    researchError = "Department code is not configured.";
  }

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            Research & Projects
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {deptName} scholarly work
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore published research, funded initiatives, and student-led projects
            emerging from {deptShortName || deptName}.
          </p>
        </header>

        <section className="space-y-6">
          <form className="space-y-3" action="/research">
            <div className="grid gap-3 md:grid-cols-[1fr,auto]">
            <input
              type="hidden"
              name="page"
              value="1"
            />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search research by title, abstract, or keywords"
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Search
            </button>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.slug || `${cat.id}`);
                  return (
                    <label
                      key={cat.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs cursor-pointer ${
                        isChecked ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="categories"
                        value={cat.slug || cat.id}
                        defaultChecked={isChecked}
                        className="hidden"
                      />
                      <span>{cat.name}</span>
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
            <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Research initiatives</h2>
              <p className="text-sm text-muted-foreground">
                Active and recent research tied to the department.
              </p>
            </div>
          </div>

          {researchError && (
            <p className="text-sm text-red-600">{researchError}</p>
          )}

          {research.length === 0 && !researchError ? (
            <p className="text-sm text-muted-foreground">
              Research portfolio is being curated. Check back soon for published items.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {research.map((item) => (
                <ResearchCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
