"use client";

import type { DepartmentDetail } from "@/lib/types/department";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectSubmissionForm } from "./ProjectSubmissionForm";
import { ResearchSubmissionForm } from "./ResearchSubmissionForm";
import { JournalSubmissionForm } from "./JournalSubmissionForm";

interface Props {
  department?: DepartmentDetail;
}

export function DepartmentSubmissionSection({ department }: Props) {
  if (!department?.uuid) {
    return null;
  }

  return (
    <section
      id="department-submissions"
      className="py-16 bg-slate-950 text-white"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <Badge className="bg-white/10 text-white uppercase tracking-[0.4em]">
            submissions
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold">
            Submit work to {department.shortName || department.name}
          </h2>
          <p className="text-white/80 text-lg">
            Students and faculty can submit projects, research updates, and
            journal manuscripts directly to the department. Verify with your
            campus email (OTP) and the department along with campus QA will
            review before publishing.
          </p>
          <p className="text-sm text-white/70">
            Use your campus email (<span className="font-mono">@tcioe.edu.np</span>)
            to request OTP. Need help? Email {department.email || "info@tcioe.edu.np"}.
          </p>
        </div>

        <Card className="bg-white text-slate-900 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Share your department achievements
            </CardTitle>
            <CardDescription>
              Choose what you want to submit. Each form keeps your department locked in.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            <Tabs defaultValue="project" className="w-full">
              <TabsList className="flex flex-wrap gap-2 bg-slate-100 justify-start">
                <TabsTrigger value="project">Submit Project</TabsTrigger>
                <TabsTrigger value="research">Submit Research</TabsTrigger>
                <TabsTrigger value="journal">Submit Journal</TabsTrigger>
              </TabsList>

              <TabsContent value="project" className="mt-6">
                <ProjectSubmissionForm department={department} />
              </TabsContent>
              <TabsContent value="research" className="mt-6">
                <ResearchSubmissionForm department={department} />
              </TabsContent>
              <TabsContent value="journal" className="mt-6">
                <JournalSubmissionForm department={department} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-10 text-center text-white/80 text-sm">
          Use the tabs above to pick the submission type. You can modify entries with
          the department team after review.
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center text-sm text-white/80">
          <Button variant="secondary" asChild>
            <a href="#department-submissions">Projects & Research</a>
          </Button>
          <Button variant="outline" className="text-white border-white/30" asChild>
            <a href="#department-submissions">Journal Articles</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
