export type ResearchCategory = {
  id: number;
  name: string;
  slug?: string;
  color?: string | null;
};

export type Research = {
  id: number;
  title: string;
  abstract: string;
  researchType: string;
  status: string;
  department: number | null;
  departmentName: string;
  slug: string | null;
  academicProgram?: number | null;
  academicProgramName?: string | null;
  academicProgramShortName?: string | null;
  principalInvestigatorShort?: string;
  fundingAgency?: string | null;
  fundingAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  thumbnail?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  viewsCount: number;
  participantsCount: number;
  categories: ResearchCategory[];
  createdAt: string;
  updatedAt: string;
};
