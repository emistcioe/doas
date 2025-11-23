import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE, SCHEDULE_API_BASE } from "@/lib/env";
import {
  getDepartment,
  listDepartmentPrograms,
} from "@/lib/data/publicDepartment";
import type { DepartmentProgram } from "@/lib/types/department";

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
    batch_year?: number | null;
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

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deptSlug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let program: DepartmentProgram | undefined;
  let scheduleError: string | null = null;
  let subjectsBySemester: Record<
    string,
    {
      subject: ScheduleSubject;
      classInfo: NonNullable<ScheduleSubject["academic_classes"]>[number];
    }[]
  > = {};

  try {
    const dept = deptSlug ? await getDepartment(deptSlug) : undefined;
    if (dept?.name) deptName = dept.name;
  } catch (error) {
    console.warn("Failed to load department for program detail:", error);
  }

  try {
    if (!deptSlug) throw new Error("Department not configured.");
    const programRes = await listDepartmentPrograms(deptSlug, { limit: 100 });
    const programs = programRes?.results || [];
    const match = programs.find(
      (p) =>
        p.slug === slug ||
        (p.shortName && p.shortName.toLowerCase() === slug.toLowerCase())
    );
    program = match;

    const facultyCode = (match?.shortName || slug || "").toUpperCase();
    if (!facultyCode) throw new Error("Program code unavailable.");

    const url = `${SCHEDULE_API_BASE}/subject/list/?faculty=${encodeURIComponent(
      facultyCode
    )}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      throw new Error(`Failed to load subjects (${res.status})`);
    }
    const data = await res.json();
    const subjects: ScheduleSubject[] = Array.isArray(data?.results)
      ? data.results
      : data?.results?.results || [];

    const semMap: typeof subjectsBySemester = {};
    subjects.forEach((subject) => {
      const classes = subject.academic_classes || [];
      classes.forEach((cls) => {
        const sem = cls.semester || "unspecified";
        if (!semMap[sem]) semMap[sem] = [];

        const exists = semMap[sem].some(
          (entry) =>
            entry.subject.id === subject.id &&
            entry.classInfo.semester === cls.semester
        );
        if (!exists) {
          semMap[sem].push({ subject, classInfo: cls });
        }
      });
    });
    // Filter: if mixed published/archived in a sem, keep only published
    Object.keys(semMap).forEach((semKey) => {
      const items = semMap[semKey];
      const hasPublished = items.some((i) => i.classInfo.is_published);
      const hasArchived = items.some((i) => i.classInfo.is_archived);
      if (hasPublished && hasArchived) {
        semMap[semKey] = items.filter((i) => i.classInfo.is_published);
      }
    });
    subjectsBySemester = semMap;
  } catch (error) {
    scheduleError =
      error instanceof Error ? error.message : "Unable to load subjects.";
  }

  if (!program) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-3xl font-bold">Program not found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find that program. Please go back to Programs and
            choose another one.
          </p>
        </div>
      </div>
    );
  }

  const semesters = formatSemOrder(Object.keys(subjectsBySemester));

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            {deptName}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">{program.name}</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {program.description ||
              "Explore subjects and curriculum details for this program."}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">{program.programType}</Badge>
            {program.shortName && (
              <Badge variant="secondary">{program.shortName}</Badge>
            )}
          </div>
        </header>

        <section className="space-y-3">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
              Subjects by semester
            </p>
            <h2 className="text-2xl font-semibold">
              Curriculum for {program.shortName || program.name}
            </h2>
          </div>

          {scheduleError && (
            <p className="text-sm text-red-600 text-center">{scheduleError}</p>
          )}

          {!scheduleError && semesters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              No subjects found for this program yet.
            </p>
          )}

          <div className="space-y-4">
            {semesters.map((sem) => (
              <Card key={sem} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg uppercase">{sem}</CardTitle>
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
                          <th className="px-4 py-2 font-semibold">Practical</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectsBySemester[sem]?.map(
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
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
