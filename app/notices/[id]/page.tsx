"use client";

import { useParams, useRouter } from "next/navigation";
import { useDepartmentNotices } from "@/hooks/use-department";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Calendar, Download, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeHtml } from "@/lib/utils/sanitize";
import Link from "next/link";

export default function NoticeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  const { data, loading, error } = useDepartmentNotices({
    ordering: "-publishedAt",
    limit: 100,
  });

  const notice = (data?.results || []).find(
    (n) => n.uuid === noticeId && n.isApprovedByDepartment
  );

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Notice Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The notice you are looking for does not exist or has been removed.
          </p>
          <Link href="/notices">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/notices" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notices
        </Link>

        {/* Notice Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {notice.category?.name && (
              <Badge variant="outline">{notice.category.name}</Badge>
            )}
            {notice.isFeatured && <Badge>Featured</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{notice.title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{fmt(notice.publishedAt)}</span>
          </div>
        </div>

        {/* Notice Content */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(notice.description || ""),
              }}
            />
          </CardContent>
        </Card>

        {/* Attachments */}
        {notice.medias && notice.medias.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attachments
            </h2>
            <div className="space-y-3">
              {notice.medias.map((m) => (
                <Card key={m.uuid}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {m.caption || "Attachment"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {m.mediaType || "File"}
                        </p>
                      </div>
                      <a href={m.file} target="_blank" rel="noreferrer">
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>

                    {/* Preview for images and PDFs */}
                    {/\.(png|jpe?g|gif|webp)$/i.test(m.file) && (
                      <div className="mt-4">
                        <img
                          src={m.file}
                          alt={m.caption || notice.title}
                          className="max-h-[60vh] w-full object-contain rounded border"
                        />
                      </div>
                    )}
                    {/\.pdf($|\?)/i.test(m.file) && (
                      <div className="mt-4 h-[70vh]">
                        <iframe
                          src={m.file}
                          className="w-full h-full rounded border"
                          title={m.caption || "PDF Preview"}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
