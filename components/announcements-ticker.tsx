"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useDepartmentEvents,
  useDepartmentNotices,
} from "@/hooks/use-department";

type Item = { kind: "event" | "notice"; title: string; href: string };

export default function AnnouncementsTicker() {
  // Fetch a few headlines
  const { data: events } = useDepartmentEvents({
    limit: 6,
    ordering: "-eventStartDate",
  });
  const { data: notices } = useDepartmentNotices({
    limit: 6,
    ordering: "-publishedAt",
  });

  const items: Item[] = useMemo(() => {
    const ev = (events?.results || []).map((e) => ({
      kind: "event" as const,
      title: e.title ?? "",
      href: "/events",
    }));
    const no = (notices?.results || []).map((n) => ({
      kind: "notice" as const,
      title: n.title ?? "",
      href: "/notices",
    }));
    // Interleave to mix both
    const out: Item[] = [];
    const max = Math.max(ev.length, no.length);
    for (let i = 0; i < max; i++) {
      if (no[i]) out.push(no[i]);
      if (ev[i]) out.push(ev[i]);
    }
    return out.length ? out : [];
  }, [events?.results, notices?.results]);

  const [index, setIndex] = useState(0);
  const [animateIn, setAnimateIn] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!items.length) return;
    timer.current = window.setInterval(() => {
      // leave
      setAnimateIn(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setAnimateIn(true);
      }, 300); // small gap for leave
    }, 6500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      timer.current = null;
    };
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="bg-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Announcements</span>
            </div>
            <div className="text-center flex-1">
              <span className="text-sm/6 opacity-80">No recent updates</span>
            </div>
            <div className="w-4" />
          </div>
        </div>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="bg-accent text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Announcements</span>
            <button
              aria-label="Previous announcement"
              className="text-white/80 hover:text-white"
              onClick={() => {
                setAnimateIn(false);
                window.setTimeout(() => {
                  setIndex((i) => (i - 1 + items.length) % items.length);
                  setAnimateIn(true);
                }, 120);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="relative h-6 flex-1 overflow-hidden text-center">
            <Link
              href={current.href}
              className={`inline-block text-sm font-medium transition-all duration-300 will-change-transform ${
                animateIn
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
              title={current.title}
            >
              {current.title}
            </Link>
          </div>

          <button
            aria-label="Next announcement"
            className="text-white/80 hover:text-white"
            onClick={() => {
              setAnimateIn(false);
              window.setTimeout(() => {
                setIndex((i) => (i + 1) % items.length);
                setAnimateIn(true);
              }, 120);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
