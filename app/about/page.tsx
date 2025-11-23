import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Globe } from "lucide-react";
import { getDepartment } from "@/lib/data/publicDepartment";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE, SCHEDULE_API_BASE } from "@/lib/env";
import { sanitizeHtml } from "@/lib/utils/sanitize";

type ScheduleSubject = {
  id: string;
  name: string;
  code: string;
  department_name?: string | null;
  faculty?: string | null;
  theory_load?: number | null;
  practical_load?: number | null;
  credit?: number | null;
  academic_classes?: {
    id: string;
    faculty: string;
    semester: string;
    is_published?: boolean;
    is_archived?: boolean;
  }[];
};

const formatSemOrder = (semesters: string[]) => {
  const order = [
    "sem1",
    "sem2",
    "sem3",
    "sem4",
    "sem5",
    "sem6",
    "sem7",
    "sem8",
    "sem9",
    "sem10",
  ];
  return semesters.slice().sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

export default async function AboutPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let dept;
  try {
    dept = slug ? await getDepartment(slug) : undefined;
  } catch (error) {
    console.warn("Failed to fetch department in about page:", error);
    dept = undefined;
  }

  // Load department subjects grouped by semester across all faculties
  let subjectsBySemester: Record<
    string,
    Record<
      string,
      {
        subject: ScheduleSubject;
        classInfo: NonNullable<ScheduleSubject["academic_classes"]>[number];
      }[]
    >
  > = {};
  let subjectsError: string | null = null;
  try {
    const url = `${SCHEDULE_API_BASE}/subject/list/?department=${encodeURIComponent(
      (DEPARTMENT_CODE || "").toUpperCase()
    )}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Failed to load subjects (${res.status})`);
    const data = await res.json();
    const subjects: ScheduleSubject[] = Array.isArray(data?.results)
      ? data.results
      : data?.results?.results || [];

    const semMap: typeof subjectsBySemester = {};
    subjects.forEach((subject) => {
      const classes = subject.academic_classes || [];
      classes.forEach((cls) => {
        const sem = cls.semester || "unspecified";
        const faculty = cls.faculty || "unspecified";
        if (!semMap[sem]) semMap[sem] = {};
        if (!semMap[sem][faculty]) semMap[sem][faculty] = [];
        const exists = semMap[sem][faculty].some(
          (entry) =>
            entry.subject.id === subject.id &&
            entry.classInfo.semester === cls.semester
        );
        if (!exists) semMap[sem][faculty].push({ subject, classInfo: cls });
      });
    });
    // Filter: if mixed published/archived inside a faculty-semester, keep only published
    Object.keys(semMap).forEach((semKey) => {
      const faculties = semMap[semKey];
      Object.keys(faculties).forEach((fac) => {
        const items = faculties[fac];
        const hasPublished = items.some((i) => i.classInfo.is_published);
        const hasArchived = items.some((i) => i.classInfo.is_archived);
        if (hasPublished && hasArchived) {
          faculties[fac] = items.filter((i) => i.classInfo.is_published);
        }
      });
    });
    subjectsBySemester = semMap;
  } catch (error) {
    subjectsError =
      error instanceof Error ? error.message : "Unable to load subjects.";
  }

  const semesters = formatSemOrder(Object.keys(subjectsBySemester));

  return (
    <div className="pb-12">
      <div className="relative isolate overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110"
          style={{
            backgroundImage: `url(${dept?.thumbnail || "/hero.jpg"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background backdrop-blur-[2px]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <Badge variant="secondary" className="px-3 py-1">
            About {dept?.shortName || "Department"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            {dept?.name || "Our Department"}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            {dept?.briefDescription ||
              "Learn about our mission, people, and the work we do."}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Overview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Who we are and what we do</CardDescription>
          </CardHeader>
          <CardContent>
            {dept?.briefDescription && (
              <p className="text-sm md:text-base text-muted-foreground leading-7 text-justify mb-4">
                {dept.briefDescription}
              </p>
            )}
            <div
              className="prose prose-sm max-w-none prose-slate dark:prose-invert text-justify"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  dept?.detailedDescription ||
                    dept?.briefDescription ||
                    "Department details will appear here soon."
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Get in touch with us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {dept?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a className="hover:underline" href={`mailto:${dept.email}`}>
                    {dept.email}
                  </a>
                </div>
              )}
              {dept?.phoneNo && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a className="hover:underline" href={`tel:${dept.phoneNo}`}>
                    {dept.phoneNo}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Follow our official channels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dept?.socialLinks?.length ? (
                dept.socialLinks.map((s) => (
                  <a
                    key={s.uuid}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">{s.platform}</span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No social links available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Focus Areas (optional tags shown only if provided in description) */}
        {/* Optional bottom brief removed to avoid duplication */}

        {/* Department subjects grouped by semester */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
              Department subjects
            </p>
            <h2 className="text-2xl font-semibold">
              Courses offered across faculties
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Subjects associated with this department, grouped by semester and
              faculty. Academic year details are omitted for brevity.
            </p>
          </div>

          {subjectsError && (
            <p className="text-sm text-red-600 text-center">{subjectsError}</p>
          )}

          {!subjectsError && semesters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Subjects will appear here once available for this department.
            </p>
          )}

          <div className="space-y-4">
            {semesters.map((sem) => {
              const facultyGroups = subjectsBySemester[sem] || {};
              const faculties = Object.keys(facultyGroups).sort();
              return faculties.map((faculty) => (
                <Card key={`${sem}-${faculty}`} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg uppercase">
                      {sem} · {faculty}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Subject</th>
                            <th className="px-4 py-2 font-semibold">Code</th>
                            <th className="px-4 py-2 font-semibold">
                              Department
                            </th>
                            <th className="px-4 py-2 font-semibold">Credit</th>
                            <th className="px-4 py-2 font-semibold">Theory</th>
                            <th className="px-4 py-2 font-semibold">
                              Practical
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {facultyGroups[faculty]?.map(
                            ({ subject, classInfo }) => (
                              <tr
                                key={`${subject.id}-${classInfo.id}`}
                                className="border-t border-border/60"
                              >
                                <td className="px-4 py-2 font-medium text-foreground">
                                  {subject.name}
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {subject.code}
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {subject.department_name || "—"}
                                </td>
                                <td className="px-4 py-2">
                                  {subject.credit ?? "—"}
                                </td>
                                <td className="px-4 py-2">
                                  {subject.theory_load ?? "—"}
                                </td>
                                <td className="px-4 py-2">
                                  {subject.practical_load ?? "—"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ));
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
