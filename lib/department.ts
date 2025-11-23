// Maps short department codes to API slugs
// Extend as needed. Synced with campus departments used in the main TCIOE site.
const CODE_TO_SLUG: Record<string, string> = {
  // Department of Applied Science
  doas: "department-of-applied-science",
  // Department of Architecture
  doarch: "department-of-architecture",
  // Department of Automobile & Mechanical Engineering
  doame: "department-of-automobile-and-mechanical-engineering",
  // Department of Civil Engineering
  doce: "department-of-civil-engineering",
  // Department of Electronics & Computer Engineering
  doece: "department-of-electronics-and-computer-engineering",
  // Department of Industrial Engineering
  doie: "department-of-industrial-engineering",
};

export function departmentSlugFromCode(code: string): string | undefined {
  const normalized = code.toLowerCase();

  // If a full slug is already provided, return it as-is.
  if (normalized.includes("department-")) return normalized;

  return CODE_TO_SLUG[normalized];
}

export function supportedDepartmentCodes(): string[] {
  return Object.keys(CODE_TO_SLUG);
}
