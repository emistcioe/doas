export type ProjectTag = {
  id: number;
  name: string;
  slug?: string;
  color?: string | null;
};

export type Project = {
  id: number;
  title: string;
  abstract: string;
  projectType: string;
  status: string;
  department: number | null;
  departmentName: string;
  academicProgram?: number | null;
  academicProgramName?: string | null;
  academicProgramShortName?: string | null;
  supervisorName?: string | null;
  academicYear?: string | null;
  thumbnail?: string | null;
  demoUrl?: string | null;
  githubUrl?: string | null;
  description?: string | null;
  slug?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  viewsCount: number;
  membersCount: number;
  tags: ProjectTag[];
  createdAt: string;
  updatedAt: string;
};
