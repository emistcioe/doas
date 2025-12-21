"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { useDepartment, useDepartmentNotices } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import Link from "next/link";

export default function NoticesPage() {
  const { data: dept } = useDepartment();
  const { data, loading, error } = useDepartmentNotices({
    ordering: "-publishedAt",
    limit: 20,
  });

  // Only show notices approved by department
  const notices = (data?.results || []).filter((n) => n.isApprovedByDepartment);
  const categories = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => n.category?.name && set.add(n.category.name));
    return ["All", ...Array.from(set)];
  }, [notices]);
  const [cat, setCat] = useState<string>("All");
  const filtered = notices.filter((n) => cat === "All" || n.category?.name === cat);

  // Helper to strip HTML and truncate description
  const getShortDescription = (html: string, maxLength = 150) => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Notices & Announcements
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Stay informed with the latest announcements, important notices, and
            updates from {dept?.name || "the department"}.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs border ${
                cat === c ? "bg-secondary text-secondary-foreground" : "bg-background"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* All Notices */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Bell className="h-6 w-6 text-secondary mr-2" />
            All Notices
          </h2>
          {loading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
          {error && <p className="text-red-500">Failed to load notices.</p>}
          {!loading && !error && (
            <div className="space-y-4">
              {filtered.map((notice) => (
                <Link key={notice.uuid} href={`/notices/${notice.uuid}`}>
                  <Card className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                    <CardHeader>
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {notice.category?.name && (
                              <Badge variant="outline">{notice.category.name}</Badge>
                            )}
                            {notice.isFeatured && <Badge>Featured</Badge>}
                          </div>
                          <CardTitle className="text-lg mb-2">
                            {notice.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {getShortDescription(notice.description || "")}
                          </CardDescription>
                        </div>
                        <div className="mt-3 lg:mt-0 text-sm text-muted-foreground flex items-center gap-4 shrink-0">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> {fmt(notice.publishedAt)}
                          </span>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
