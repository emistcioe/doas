"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Download, ExternalLink, Pin, User } from "lucide-react";
import { useDepartment, useDepartmentNotices } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import { useMemo, useState } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

export default function NoticesPage() {
  const { data: dept } = useDepartment();
  const { data, loading, error } = useDepartmentNotices({
    ordering: "-publishedAt",
    limit: 20,
  });

  const notices = data?.results || [];
  const categories = useMemo(() => {
    const set = new Set<string>();
    notices.forEach((n) => n.category?.name && set.add(n.category.name));
    return ["All", ...Array.from(set)];
  }, [notices]);
  const [cat, setCat] = useState<string>("All");
  const filtered = notices.filter((n) => cat === "All" || n.category?.name === cat);
  const [openMediaId, setOpenMediaId] = useState<string | null>(null);
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
                <Card key={notice.uuid} className="hover:shadow-md transition-shadow overflow-hidden">
                 <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {notice.category?.name && (
                            <Badge variant="outline">{notice.category.name}</Badge>
                          )}
                          {notice.isFeatured && <Badge>Featured</Badge>}
                        </div>
                        <CardTitle className="text-lg mb-2 truncate">
                          {notice.title}
                        </CardTitle>
                        <CardDescription>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(notice.description || ""),
                            }}
                          />
                        </CardDescription>
                      </div>
                      <div className="mt-3 lg:mt-0 text-sm text-muted-foreground flex items-center gap-4 shrink-0">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> {fmt(notice.publishedAt)}
                        </span>
                        {notice.author?.fullName && (
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" /> {notice.author.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {(notice.medias || []).map((m) => (
                        <div key={m.uuid} className="flex items-center justify-between gap-2">
                          <div className="text-sm text-muted-foreground truncate">
                            {m.caption || "Attachment"}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenMediaId((id) => (id === m.uuid ? null : m.uuid))}
                            >
                              Preview
                            </Button>
                            <a href={m.file} target="_blank" rel="noreferrer">
                              <Button size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}

                      {(notice.medias || []).map((m) => (
                        <Collapsible key={m.uuid + "-content"} open={openMediaId === m.uuid}>
                          <CollapsibleContent>
                            <div className="mt-2 rounded-md border bg-muted/30 p-2">
                              {/\.(png|jpe?g|gif|webp)$/i.test(m.file) ? (
                                <img src={m.file} alt={m.caption || notice.title} className="max-h-[60vh] w-full object-contain rounded" />
                              ) : /\.pdf($|\?)/i.test(m.file) ? (
                                <div className="h-[70vh]">
                                  <iframe src={m.file} className="w-full h-full rounded" />
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">Preview not available.</p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
