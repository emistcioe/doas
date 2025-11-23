import { DEPARTMENT_CODE, getPublicApiUrl, API_BASE } from "@/lib/env";
import { departmentSlugFromCode } from "@/lib/department";
import { getDepartment } from "@/lib/data/publicDepartment";

type GalleryItem = {
  uuid: string;
  image: string;
  caption?: string | null;
  createdAt?: string | null;
};

const formatGalleryDate = (value?: string | null) => {
  if (!value) return "";
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

export default async function GalleryPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);
  interface Department {
    uuid?: string | null;
    name?: string | null;
    shortName?: string | null;
    [key: string]: any;
  }

  let department: Department | null = null;
  try {
    if (slug) {
      department = await getDepartment(slug);
    }
  } catch (error) {
    console.warn("Unable to load department for gallery:", error);
  }

  let galleryItems: GalleryItem[] = [];
  let galleryError: string | null = null;

  if (department?.uuid) {
    try {
      const params = new URLSearchParams({
        limit: "12",
        source_type: "department_gallery",
        source_identifier: department.uuid,
      });
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE || "https://cdn.tcioe.edu.np";
      const url = new URL("/api/v1/public/website-mod/global-gallery", apiBase);
      url.search = params.toString();
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 120 },
      });
      if (!response.ok) {
        galleryError = `Gallery service returned ${response.status}`;
      } else {
        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        galleryItems = results.map((item: any) => {
          // Normalize image URL:
          // - If absolute and points to localhost, replace origin with API_BASE
          // - If absolute and not localhost, keep as-is
          // - If relative (starts with / or no protocol), prefix with API_BASE via getPublicApiUrl
          let image = item.image || "";
          try {
            const parsed = new URL(image);
            // absolute URL
            if (
              parsed.hostname === "localhost" ||
              parsed.hostname === "127.0.0.1"
            ) {
              // use only the pathname/search/hash and build with API_BASE
              image = getPublicApiUrl(
                parsed.pathname + parsed.search + parsed.hash
              );
            } else {
              image = parsed.toString();
            }
          } catch (e) {
            // image was not an absolute URL — treat as path
            image = getPublicApiUrl(
              image.startsWith("/") ? image : `/${image}`
            );
          }

          return {
            uuid: item.uuid,
            image,
            caption: item.caption,
            createdAt: item.createdAt,
          };
        });
      }
    } catch (error) {
      galleryError = "Failed to load gallery images.";
      console.error("Gallery fetch error:", error);
    }
  }

  return (
    <div className="bg-background py-12">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">
            Department gallery
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {department?.name || "Department gallery"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {department?.shortName
              ? `A curated album of ${department.shortName} labs, events, and research moments.`
              : "Photos and visuals from departments across the campus community."}
          </p>
        </div>

        {galleryError && (
          <p className="text-sm text-red-600 text-center">{galleryError}</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <article key={item.uuid} className="space-y-3">
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={item.image}
                  alt={
                    item.caption ||
                    department?.shortName ||
                    "Department gallery image"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {item.caption || department?.shortName || "Gallery image"}
                </p>
                {item.createdAt && (
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {formatGalleryDate(item.createdAt)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {galleryItems.length === 0 && !galleryError && (
          <p className="text-center text-sm text-muted-foreground">
            Gallery is being populated. Check back after the next event for
            fresh pictures.
          </p>
        )}
      </div>
    </div>
  );
}
