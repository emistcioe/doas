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
import { Download, Eye } from "lucide-react";
import { useDepartment, useDepartmentDownloads } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMemo, useState } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

export default function DownloadsPage() {
  const PAGE_SIZE = 8;
  const { data: dept } = useDepartment();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const { data, loading, error } = useDepartmentDownloads({
    limit: PAGE_SIZE,
    offset,
  });
  const downloads = data?.results || [];
  const pageCount = Math.max(1, Math.ceil((data?.count || 0) / PAGE_SIZE));

  const pages = useMemo(() => {
    const total = pageCount;
    const current = page;
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    if (start > 1) arr.unshift(1);
    if (end < total) arr.push(total);
    return Array.from(new Set(arr));
  }, [page, pageCount]);

  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {dept?.name || "Department"} Downloads
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Access important documents, forms, and resources for students,
            faculty, and prospective applicants.
          </p>
        </div>

        {/* Downloads List */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">All Downloads</h2>
          {loading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {error && <p className="text-red-500">Failed to load downloads.</p>}
          {!loading && !error && (
            <div className="space-y-3">
              {downloads.map((d) => (
                <Card key={d.uuid} className="hover:shadow-md transition-shadow py-4">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-base sm:text-lg font-semibold leading-tight">{d.title}</h4>
                          <Badge variant="outline">File</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {d.description}
                        </p>
                      </div>
                      <div className="flex gap-2 self-start lg:self-auto">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setOpenId((id) => (id === d.uuid ? null : d.uuid))
                          }
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <a href={d.file} target="_blank" rel="noreferrer">
                          <Button className="bg-slate-600 hover:bg-secondary/10">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                    <Collapsible open={openId === d.uuid}>
                      <CollapsibleContent>
                        <div className="mt-3 rounded-md border bg-muted/30 p-2">
                          {/\.(png|jpe?g|gif|webp)$/i.test(d.file) ? (
                            <img
                              src={d.file}
                              alt={d.title}
                              className="max-h-[70vh] w-full object-contain rounded"
                            />
                          ) : /\.pdf($|\?)/i.test(d.file) ? (
                            <div className="h-[70vh]">
                              <iframe
                                src={d.file}
                                className="w-full h-full rounded"
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Preview not available.
                            </p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
              {/* Pagination */}
              {pageCount > 1 && (
                <Pagination className="pt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>
                    {pages.map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(pageCount, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
