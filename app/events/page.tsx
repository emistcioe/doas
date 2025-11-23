"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ExternalLink } from "lucide-react";
import { getPublicApiUrl } from "@/lib/env";
import { useDepartment, useDepartmentEvents } from "@/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";

type GlobalEventItem = {
  uuid: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
};

const formatEventDate = (value?: string | null) => {
  if (!value) return "TBD";
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

const formatEventRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return "Dates to be announced";
  const from = formatEventDate(start);
  if (!end) return from;
  const to = formatEventDate(end);
  return from === to ? from : `${from} — ${to}`;
};

const sanitizeText = (value?: string | null) =>
  value
    ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "";

const truncateText = (value?: string | null, limit = 120) => {
  const text = sanitizeText(value);
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
};

const humanizeEventType = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    : "";

export default function EventsPage() {
  const { data: dept } = useDepartment();
  const { data, loading, error } = useDepartmentEvents({
    ordering: "-eventStartDate",
    limit: 20,
    departmentUuid: dept?.uuid,
  });

  const events = data?.results || [];
  const tcase = (s?: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
  const statusOf = (s?: string | null, e?: string | null) => {
    const now = new Date();
    const sd = s ? new Date(s) : null;
    const ed = e ? new Date(e) : null;
    if (ed && !Number.isNaN(ed.getTime()) && ed.getTime() < now.getTime())
      return { label: "Finished", variant: "outline" as const };
    if (sd && !Number.isNaN(sd.getTime()) && sd.getTime() > now.getTime())
      return { label: "Upcoming", variant: "secondary" as const };
    return { label: "Running", variant: "default" as const };
  };

  const fmt = (d?: string | null) => {
    if (!d) return "TBD";
    try {
      const date = new Date(d);
      return Number.isNaN(date.getTime())
        ? d
        : date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
    } catch {
      return d;
    }
  };

  const [globalEvents, setGlobalEvents] = useState<GlobalEventItem[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!dept?.uuid) {
      setGlobalEvents([]);
      setGlobalLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchGlobalEvents = async () => {
      setGlobalLoading(true);
      setGlobalError(null);
      try {
        const params = new URLSearchParams({
          limit: "4",
          department: dept.uuid,
          ordering: "-eventStartDate",
        });
        const response = await fetch(
          `${getPublicApiUrl("/api/v1/public/website-mod/global-events")}?${params.toString()}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to load campus events (${response.status})`);
        }
        const data = await response.json();
        const items = Array.isArray(data?.results) ? data.results : [];
        setGlobalEvents(items);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setGlobalError(
          error instanceof Error
            ? error.message
            : "Unable to load campus events right now."
        );
      } finally {
        setGlobalLoading(false);
      }
    };

    void fetchGlobalEvents();

    return () => {
      controller.abort();
    };
  }, [dept?.uuid]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {dept?.name || "Department"} Events
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
            Stay updated with our upcoming events, conferences, workshops, and
            academic activities that foster learning and collaboration.
          </p>
        </div>

        {/* Events Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Events</h2>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
          {error && <p className="text-red-500">Failed to load events.</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.uuid}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-border/70 hover:border-primary/40"
                >
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    {event.thumbnail && (
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Badge variant={statusOf(event.eventStartDate, event.eventEndDate).variant}>
                        {statusOf(event.eventStartDate, event.eventEndDate).label}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline">{tcase(event.eventType)}</Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold leading-tight line-clamp-1">
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {truncateText(event.description, 140)}
                        </CardDescription>
                      </div>
                      <div className="hidden sm:flex gap-2 shrink-0 opacity-80">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-foreground/80">
                          {fmt(event.eventStartDate)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-xs bg-muted text-foreground/80">
                          {fmt(event.eventEndDate)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> {fmt(event.eventStartDate)} — {fmt(event.eventEndDate)}
                      </span>
                      <span className="hidden sm:flex items-center gap-1">
                        <Users className="h-4 w-4" /> {tcase(event.eventType)}
                      </span>
                    </div>
                    <Button variant="secondary" className="w-full group-hover:shadow-sm">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8 border-t border-border/70 pt-12">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">
              Campus highlights
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Global events tied to {dept?.shortName || "your department"}
            </h2>
            <p className="text-muted-foreground">
              Events that bring the whole campus together — filtered for your
              department so you know what’s nearby.
            </p>
          </div>

          {globalLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : globalError ? (
            <p className="text-sm text-red-600 text-center">{globalError}</p>
          ) : globalEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No campus-wide events are linked to this department right now.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {globalEvents.map((event) => (
                <div
                  key={event.uuid}
                  className="space-y-3 rounded-2xl border border-border/70 bg-white p-5 shadow-sm shadow-border/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    {event.eventType && (
                      <Badge variant="outline">
                        {humanizeEventType(event.eventType)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatEventRange(event.eventStartDate, event.eventEndDate)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateText(event.description, 100)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              className="w-full max-w-xs"
              asChild
            >
              <a
                href="https://tcioe.edu.np/events"
                target="_blank"
                rel="noreferrer"
              >
                Browse campus-wide events
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
