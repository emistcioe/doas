"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useDepartment, useDepartmentPrograms } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgramsPage() {
  const { data: dept } = useDepartment();
  const { data, loading, error } = useDepartmentPrograms({ limit: 50 });
  const programs = (data?.results || []).slice();

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {dept?.name || "Department"} Programs
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Discover our comprehensive range of academic programs. Click into a
            program to view its subject lineup and details.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading &&
            [...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-36 bg-muted" />
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">
                    <Skeleton className="h-5 w-2/3" />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          {error && <p className="text-red-500">Failed to load programs.</p>}
          {!loading &&
            !error &&
            programs.map((program) => {
              const slug =
                program.slug || program.shortName?.toLowerCase() || "program";
              return (
                <Card key={program.uuid} className="overflow-hidden">
                  <div className="w-full h-36 bg-muted overflow-hidden">
                    {program.thumbnail && (
                      <img
                        src={program.thumbnail}
                        alt={program.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg truncate">
                      {program.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4 space-y-3">
                    <Badge variant="outline">{program.programType}</Badge>
                    <Link
                      href={`/programs/${encodeURIComponent(slug)}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                    >
                      View subjects <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}
