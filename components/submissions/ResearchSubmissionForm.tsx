"use client";

import { useEffect, useState } from "react";
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
import {
  PARTICIPANT_TYPES,
  RESEARCH_STATUSES,
  RESEARCH_TYPES,
} from "./constants";

interface ParticipantForm {
  fullName: string;
  participantType: string;
  email: string;
  role: string;
}

interface ResearchFormValues {
  title: string;
  abstract: string;
  description: string;
  researchType: string;
  status: string;
  principalInvestigator: string;
  piEmail: string;
  startDate: string;
  endDate: string;
  fundingAgency: string;
  fundingAmount: string;
  keywords: string;
  methodology: string;
  expectedOutcomes: string;
  publicationsUrl: string;
  projectUrl: string;
  githubUrl: string;
  submittedByName: string;
  submittedByEmail: string;
  participants: ParticipantForm[];
}

const defaultValues: ResearchFormValues = {
  title: "",
  abstract: "",
  description: "",
  researchType: "applied",
  status: "proposed",
  principalInvestigator: "",
  piEmail: "",
  startDate: "",
  endDate: "",
  fundingAgency: "",
  fundingAmount: "",
  keywords: "",
  methodology: "",
  expectedOutcomes: "",
  publicationsUrl: "",
  projectUrl: "",
  githubUrl: "",
  submittedByName: "",
  submittedByEmail: "",
  participants: [
    { fullName: "", participantType: "student", email: "", role: "Researcher" },
  ],
};

interface Props {
  department: DepartmentDetail;
}

export function ResearchSubmissionForm({ department }: Props) {
  const form = useForm<ResearchFormValues>({ defaultValues });
  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "participants" });
  const { toast } = useToast();
  const otp = useSubmissionOtp("research_submission");
  const [otpCode, setOtpCode] = useState("");

  const submittedEmail = watch("submittedByEmail");
  const submittedName = watch("submittedByName");

  useEffect(() => {
    otp.reset();
    setOtpCode("");
  }, [submittedEmail, otp]);

  const handleRequestOtp = async () => {
    if (!submittedEmail || !submittedName) {
      toast({ description: "Enter your name and campus email", variant: "destructive" });
      return;
    }
    try {
      await otp.requestOtp({ email: submittedEmail.trim(), fullName: submittedName.trim() });
      toast({ description: "Verification code sent" });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unable to send code",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast({ description: "Enter the OTP received in your email", variant: "destructive" });
      return;
    }
    try {
      await otp.verifyOtp({ email: submittedEmail.trim(), code: otpCode.trim() });
      toast({ description: "Email verified" });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Unable to verify the code",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ResearchFormValues) => {
    if (otp.status !== "verified" || !otp.sessionId) {
      toast({ description: "Verify your campus email before submitting", variant: "destructive" });
      return;
    }

    const participants = values.participants
      .map((participant) => ({
        full_name: participant.fullName.trim(),
        participant_type: participant.participantType,
        email: participant.email.trim() || undefined,
        role: participant.role.trim() || undefined,
        department: department.uuid,
      }))
      .filter((participant) => participant.full_name);

    const funding = Number(values.fundingAmount);
    const payload = {
      title: values.title.trim(),
      abstract: values.abstract.trim(),
      description: values.description.trim(),
      research_type: values.researchType,
      status: values.status,
      principal_investigator: values.principalInvestigator.trim(),
      pi_email: values.piEmail.trim(),
      start_date: values.startDate || undefined,
      end_date: values.endDate || undefined,
      funding_agency: values.fundingAgency.trim() || undefined,
      funding_amount: Number.isNaN(funding) ? undefined : funding,
      keywords: values.keywords.trim() || undefined,
      methodology: values.methodology.trim() || undefined,
      expected_outcomes: values.expectedOutcomes.trim() || undefined,
      publications_url: values.publicationsUrl.trim() || undefined,
      project_url: values.projectUrl.trim() || undefined,
      github_url: values.githubUrl.trim() || undefined,
      submitted_by_name: values.submittedByName.trim(),
      submitted_by_email: submittedEmail.trim(),
      department: department.uuid,
      participants,
      otp_session: otp.sessionId,
    };

    try {
      const response = await fetch("/api/submissions/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.detail || data?.error || "Failed to submit research";
        throw new Error(message);
      }
      toast({ description: "Research submitted for departmental review" });
      reset(defaultValues);
      otp.reset();
      setOtpCode("");
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Failed to submit research",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Research title</Label>
          <Input id="title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="researchType">Type</Label>
          <Select
            value={watch("researchType")}
            onValueChange={(value) => form.setValue("researchType", value)}
          >
            <SelectTrigger id="researchType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select value={watch("status")} onValueChange={(value) => form.setValue("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {RESEARCH_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="principalInvestigator">Principal investigator</Label>
          <Input
            id="principalInvestigator"
            {...register("principalInvestigator", { required: "Required" })}
          />
          {errors.principalInvestigator && (
            <p className="text-sm text-red-600">{errors.principalInvestigator.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="piEmail">PI email</Label>
          <Input id="piEmail" type="email" {...register("piEmail", { required: "Required" })} />
          {errors.piEmail && <p className="text-sm text-red-600">{errors.piEmail.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="startDate">Start date</Label>
          <Input type="date" id="startDate" {...register("startDate")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">End date</Label>
          <Input type="date" id="endDate" {...register("endDate")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="fundingAgency">Funding agency</Label>
          <Input id="fundingAgency" {...register("fundingAgency")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="fundingAmount">Funding amount (NRs)</Label>
          <Input id="fundingAmount" type="number" step="0.01" {...register("fundingAmount")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="abstract">Abstract</Label>
        <Textarea id="abstract" rows={3} {...register("abstract")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Detailed description</Label>
        <Textarea id="description" rows={5} {...register("description")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="keywords">Keywords</Label>
          <Input id="keywords" placeholder="AI, renewable energy" {...register("keywords")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="expectedOutcomes">Expected outcomes</Label>
          <Input id="expectedOutcomes" {...register("expectedOutcomes")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="methodology">Methodology</Label>
          <Input id="methodology" {...register("methodology")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="publicationsUrl">Publications URL</Label>
          <Input id="publicationsUrl" type="url" {...register("publicationsUrl")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="projectUrl">Project URL</Label>
          <Input id="projectUrl" type="url" {...register("projectUrl")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" type="url" {...register("githubUrl")} />
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-900">Participants</h3>
          <p className="text-sm text-slate-600">Optional but helpful for credits.</p>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Participant name</Label>
              <Input placeholder="Full name" {...register(`participants.${index}.fullName`)} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Input placeholder="Researcher" {...register(`participants.${index}.role`)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={watch(`participants.${index}.participantType`)}
                onValueChange={(value) => form.setValue(`participants.${index}.participantType`, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PARTICIPANT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="name@tcioe.edu.np" {...register(`participants.${index}.email`)} />
            </div>
            {fields.length > 1 && (
              <div className="md:col-span-2 text-right">
                <Button type="button" variant="ghost" onClick={() => remove(index)}>
                  Remove participant
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ fullName: "", participantType: "student", email: "", role: "Researcher" })
          }
        >
          Add participant
        </Button>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-primary-blue/5">
        <h3 className="font-semibold text-slate-900">Campus email verification</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="submittedByName">Your full name</Label>
            <Input
              id="submittedByName"
              {...register("submittedByName", { required: "Required" })}
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
              {...register("submittedByEmail", { required: "Required" })}
            />
            {errors.submittedByEmail && (
              <p className="text-sm text-red-600">{errors.submittedByEmail.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button type="button" onClick={handleRequestOtp} disabled={otp.loading || !submittedEmail || !submittedName}>
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
          {otp.status === "verified" && <span className="text-sm text-green-700">Email verified</span>}
          {otp.error && <span className="text-sm text-red-600">{otp.error}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || otp.status !== "verified"}>
          {isSubmitting ? "Submitting..." : "Submit research"}
        </Button>
      </div>
    </form>
  );
}
