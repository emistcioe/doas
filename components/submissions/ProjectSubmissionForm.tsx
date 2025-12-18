"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import type { DepartmentDetail } from "@/lib/types/department";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSubmissionOtp } from "@/hooks/use-submission-otp";
import { PROJECT_TYPES } from "./constants";

interface ProjectMemberForm {
  fullName: string;
  rollNumber: string;
  email: string;
  role: string;
}

interface ProjectFormValues {
  title: string;
  abstract: string;
  description: string;
  projectType: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  githubUrl: string;
  demoUrl: string;
  technologiesUsed: string;
  submittedByName: string;
  submittedByEmail: string;
  members: ProjectMemberForm[];
}

const defaultValues: ProjectFormValues = {
  title: "",
  abstract: "",
  description: "",
  projectType: "final_year",
  supervisorName: "",
  supervisorEmail: "",
  startDate: "",
  endDate: "",
  academicYear: "",
  githubUrl: "",
  demoUrl: "",
  technologiesUsed: "",
  submittedByName: "",
  submittedByEmail: "",
  members: [
    { fullName: "", rollNumber: "", email: "", role: "Team Member" },
  ],
};

interface Props {
  department: DepartmentDetail;
}

export function ProjectSubmissionForm({ department }: Props) {
  const form = useForm<ProjectFormValues>({ defaultValues });
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "members" });
  const { toast } = useToast();
  const otp = useSubmissionOtp("project_submission");
  const [otpCode, setOtpCode] = useState("");

  const submittedEmail = watch("submittedByEmail");
  const submittedName = watch("submittedByName");

  useEffect(() => {
    otp.reset();
    setOtpCode("");
  }, [submittedEmail, otp]);

  const memberLabel = useMemo(() => (index: number) => `Team member ${index + 1}`, []);

  const handleRequestOtp = async () => {
    if (!submittedEmail || !submittedName) {
      toast({ description: "Enter your name and campus email first", variant: "destructive" });
      return;
    }
    try {
      await otp.requestOtp({ email: submittedEmail.trim(), fullName: submittedName.trim() });
      toast({ description: "Verification code sent. Check your inbox." });
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : "Unable to send verification code",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast({ description: "Enter the OTP from your email", variant: "destructive" });
      return;
    }
    try {
      await otp.verifyOtp({ email: submittedEmail.trim(), code: otpCode.trim() });
      toast({ description: "Email verified successfully" });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unable to verify the code",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (otp.status !== "verified" || !otp.sessionId) {
      toast({ description: "Verify your campus email before submitting", variant: "destructive" });
      return;
    }

    const members = values.members
      .map((member) => ({
        full_name: member.fullName.trim(),
        roll_number: member.rollNumber.trim(),
        email: member.email.trim() || undefined,
        role: member.role.trim() || undefined,
      }))
      .filter((member) => member.full_name && member.roll_number);

    if (members.length === 0) {
      toast({ description: "Add at least one team member", variant: "destructive" });
      return;
    }

    const payload = {
      title: values.title.trim(),
      abstract: values.abstract.trim(),
      description: values.description.trim(),
      project_type: values.projectType,
      supervisor_name: values.supervisorName.trim(),
      supervisor_email: values.supervisorEmail.trim() || undefined,
      start_date: values.startDate || undefined,
      end_date: values.endDate || undefined,
      academic_year: values.academicYear.trim() || undefined,
      github_url: values.githubUrl.trim() || undefined,
      demo_url: values.demoUrl.trim() || undefined,
      technologies_used: values.technologiesUsed.trim() || undefined,
      submitted_by_name: values.submittedByName.trim(),
      submitted_by_email: submittedEmail.trim(),
      department: department.uuid,
      members,
      otp_session: otp.sessionId,
    };

    try {
      const response = await fetch("/api/submissions/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.detail || data?.error || "Failed to submit project";
        throw new Error(message);
      }
      toast({ description: "Project submitted for review" });
      reset(defaultValues);
      otp.reset();
      setOtpCode("");
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Failed to submit project",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Project title</Label>
          <Input id="title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectType">Project type</Label>
          <Select
            value={watch("projectType")}
            onValueChange={(value) => form.setValue("projectType", value)}
          >
            <SelectTrigger id="projectType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="supervisorName">Supervisor name</Label>
          <Input
            id="supervisorName"
            {...register("supervisorName", { required: "Supervisor name is required" })}
          />
          {errors.supervisorName && (
            <p className="text-sm text-red-600">{errors.supervisorName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="supervisorEmail">Supervisor email</Label>
          <Input id="supervisorEmail" type="email" {...register("supervisorEmail")}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input type="date" id="startDate" {...register("startDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input type="date" id="endDate" {...register("endDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic year</Label>
          <Input id="academicYear" placeholder="2079/2080" {...register("academicYear")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" type="url" placeholder="https://github.com/..." {...register("githubUrl")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demoUrl">Demo URL</Label>
          <Input id="demoUrl" type="url" placeholder="https://" {...register("demoUrl")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="abstract">Abstract</Label>
        <Textarea id="abstract" rows={3} {...register("abstract")}></Textarea>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Detailed description</Label>
        <Textarea id="description" rows={5} {...register("description")}></Textarea>
      </div>
      <div className="space-y-2">
        <Label htmlFor="technologiesUsed">Technologies</Label>
        <Textarea
          id="technologiesUsed"
          rows={2}
          placeholder="React, Django, PostgreSQL"
          {...register("technologiesUsed")}
        ></Textarea>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-900">Team members</h3>
          <p className="text-sm text-slate-600">Add at least one student.</p>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>{memberLabel(index)}</Label>
              <Input
                placeholder="Full name"
                {...register(`members.${index}.fullName`, {
                  required: index === 0 ? "Name is required" : false,
                })}
              />
              {errors.members?.[index]?.fullName && (
                <p className="text-sm text-red-600">
                  {errors.members?.[index]?.fullName?.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Roll number</Label>
              <Input
                placeholder="Roll number"
                {...register(`members.${index}.rollNumber`, {
                  required: index === 0 ? "Roll number is required" : false,
                })}
              />
              {errors.members?.[index]?.rollNumber && (
                <p className="text-sm text-red-600">
                  {errors.members?.[index]?.rollNumber?.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="name@tcioe.edu.np" {...register(`members.${index}.email`)} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Input placeholder="Team Member" {...register(`members.${index}.role`)} />
            </div>
            {fields.length > 1 && (
              <div className="md:col-span-2 text-right">
                <Button type="button" variant="ghost" onClick={() => remove(index)}>
                  Remove member
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ fullName: "", rollNumber: "", email: "", role: "Team Member" })
          }
        >
          Add another member
        </Button>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-primary-blue/5">
        <h3 className="font-semibold text-slate-900">Campus email verification</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="submittedByName">Your full name</Label>
            <Input
              id="submittedByName"
              placeholder="Submitter name"
              {...register("submittedByName", { required: "Your name is required" })}
            />
            {errors.submittedByName && (
              <p className="text-sm text-red-600">{errors.submittedByName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="submittedByEmail">Campus email</Label>
            <Input
              id="submittedByEmail"
              type="email"
              placeholder="name@tcioe.edu.np"
              {...register("submittedByEmail", { required: "Campus email is required" })}
            />
            {errors.submittedByEmail && (
              <p className="text-sm text-red-600">{errors.submittedByEmail.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            type="button"
            onClick={handleRequestOtp}
            disabled={otp.loading || !submittedEmail || !submittedName}
          >
            {otp.loading ? "Sending..." : "Send code"}
          </Button>
          <div className="flex items-center gap-2">
            <Input
              placeholder="6-digit OTP"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
            />
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.verifying || otp.status !== "sent" || !otpCode}
            >
              {otp.verifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
          {otp.status === "verified" && (
            <span className="text-sm text-green-700">Email verified</span>
          )}
          {otp.error && <span className="text-sm text-red-600">{otp.error}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || otp.status !== "verified"}>
          {isSubmitting ? "Submitting..." : "Submit project"}
        </Button>
      </div>
    </form>
  );
}
