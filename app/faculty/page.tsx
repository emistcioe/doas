"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDepartment, useDepartmentStaffs } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENT_CODE, SCHEDULE_API_BASE } from "@/lib/env";

export default function FacultyPage() {
  const { data: dept } = useDepartment();
  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
  } = useDepartmentStaffs({
    limit: 100,
    ordering: "displayOrder",
  });
  const staff =
    staffData?.results
      ?.slice()
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<
    {
      id: string;
      name: string;
      email?: string | null;
      designation?: string | null;
      teacher_type?: string | null;
      subjects?: { id: string; name: string; code: string }[];
    }[]
  >([]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const deptRes = await fetch(`${SCHEDULE_API_BASE}/department/list/`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!deptRes.ok) throw new Error(`Department fetch failed ${deptRes.status}`);
        const deptJson = await deptRes.json();
        const code = (DEPARTMENT_CODE || "").toUpperCase();
        const target = (deptJson?.results || []).find(
          (d: any) => (d?.name || "").toUpperCase() === code
        );
        const departmentId = target?.id;
        if (!departmentId) throw new Error("Department not found in schedule backend.");

        const teacherRes = await fetch(
          `${SCHEDULE_API_BASE}/teacher/list/?department=${encodeURIComponent(departmentId)}`,
          { headers: { Accept: "application/json" }, signal: controller.signal }
        );
        if (!teacherRes.ok) throw new Error(`Teacher fetch failed ${teacherRes.status}`);
        const teacherJson = await teacherRes.json();
        setTeachers(
          (teacherJson?.results || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            designation: t.designation,
            teacher_type: t.teacher_type,
            subjects: t.subjects || [],
          }))
        );
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load faculty.");
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {dept?.name || "Department"} Faculty & Staff
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Meet our distinguished faculty members and dedicated staff who are
            committed to excellence in education and research.
          </p>
        </div>

        {/* Department Staff from CMS */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Department Staff</h2>
          {staffLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {staffError && (
            <p className="text-red-500">Failed to load department staff.</p>
          )}
          {!staffLoading && !staffError && staff.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => {
                const photoSrc =
                  member.photo && member.photo.trim().length > 0
                    ? member.photo
                    : "/placeholder-user.jpg";
                return (
                  <article
                    key={member.uuid}
                    className="group relative flex flex-col items-center rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mt-6 h-28 w-28 overflow-hidden rounded-2xl border-2 border-white bg-gray-50 shadow-md">
                      <img
                        src={photoSrc}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 px-5">
                      <span className="h-0.5 w-10 rounded-full bg-primary/60" />
                      <span className="h-0.5 w-10 rounded-full bg-primary/60" />
                    </div>
                    <div className="flex flex-col items-center gap-1 px-6 pb-6 pt-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                        {member.designation || "Staff"}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member.title ? `${member.title} ` : ""}
                        {member.name}
                      </h3>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="mt-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                        >
                          {member.email}
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!staffLoading && !staffError && staff.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No staff records available right now.
            </p>
          )}
        </div>

        {/* Teachers from schedule backend */}
        <div className="space-y-4 mt-12">
          <h2 className="text-3xl font-bold">Teachers</h2>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {error && <p className="text-red-500">Failed to load teachers.</p>}
          {!loading && !error && teachers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((member) => (
                <Card
                  key={member.id}
                  className="text-left border border-gray-200 shadow-sm hover:shadow-md transition"
                >
                  <CardHeader className="pb-3 space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {member.designation
                        ? member.designation.replace(/_/g, " ")
                        : "Faculty"}
                    </CardDescription>
                    {member.teacher_type && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {member.teacher_type.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {member.email && (
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">Email: </span>
                        <a
                          href={`mailto:${member.email}`}
                          className="text-primary hover:underline break-all"
                        >
                          {member.email}
                        </a>
                      </p>
                    )}
                    {member.subjects?.length ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">
                          Subjects
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {member.subjects.map((s) => (
                            <span
                              key={s.id}
                              className="text-xs rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 leading-tight"
                            >
                              {s.name} ({s.code})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Subjects not assigned yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && !error && teachers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No teacher data available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
