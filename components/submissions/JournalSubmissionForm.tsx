"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import type { DepartmentDetail } from "@/lib/types/department";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubmissionOtp } from "@/hooks/use-submission-otp";

interface AuthorForm {
  givenName: string;
  familyName: string;
  email: string;
  affiliation: string;
  country: string;
}

interface JournalFormValues {
  title: string;
  genre: string;
  abstract: string;
  keywords: string;
  discipline: string;
  year: string;
  volume: string;
  number: string;
  pages: string;
  submittedByName: string;
  submittedByEmail: string;
  authors: AuthorForm[];
}

const defaultValues: JournalFormValues = {
  title: "",
  genre: "",
  abstract: "",
  keywords: "",
  discipline: "",
  year: "",
  volume: "",
  number: "",
  pages: "",
  submittedByName: "",
  submittedByEmail: "",
  authors: [
    { givenName: "", familyName: "", email: "", affiliation: "", country: "" },
  ],
};

interface Props {
  department: DepartmentDetail;
}

export function JournalSubmissionForm({ department }: Props) {
  const form = useForm<JournalFormValues>({ defaultValues });
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "authors" });
  const { toast } = useToast();
  const otp = useSubmissionOtp("journal_submission");
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
      toast({ description: "Enter the OTP from your inbox", variant: "destructive" });
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

  const onSubmit = async (values: JournalFormValues) => {
    if (otp.status !== "verified" || !otp.sessionId) {
      toast({ description: "Verify your campus email before submitting", variant: "destructive" });
      return;
    }

    const authors = values.authors
      .map((author) => ({
        given_name: author.givenName.trim(),
        family_name: author.familyName.trim() || undefined,
        email: author.email.trim() || undefined,
        affiliation: author.affiliation.trim() || undefined,
        country: author.country.trim() || undefined,
      }))
      .filter((author) => author.given_name);

    if (authors.length === 0) {
      toast({ description: "Add at least one author", variant: "destructive" });
      return;
    }

    const year = Number(values.year);
    const volume = Number(values.volume);
    const number = Number(values.number);

    const payload = {
      title: values.title.trim(),
      genre: values.genre.trim(),
      abstract: values.abstract.trim(),
      keywords: values.keywords.trim() || undefined,
      discipline: values.discipline.trim() || undefined,
      year: Number.isNaN(year) ? undefined : year,
      volume: Number.isNaN(volume) ? undefined : volume,
      number: Number.isNaN(number) ? undefined : number,
      pages: values.pages.trim() || undefined,
      submitted_by_name: values.submittedByName.trim(),
      submitted_by_email: submittedEmail.trim(),
      department: department.uuid,
      authors,
      otp_session: otp.sessionId,
    };

    try {
      const response = await fetch("/api/submissions/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.detail || data?.error || "Failed to submit article";
        throw new Error(message);
      }
      toast({ description: "Journal article submitted" });
      reset(defaultValues);
      otp.reset();
      setOtpCode("");
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Failed to submit article",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="title">Article title</Label>
          <Input id="title" {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="genre">Genre</Label>
          <Input id="genre" placeholder="Original Article" {...register("genre", { required: "Genre is required" })} />
          {errors.genre && <p className="text-sm text-red-600">{errors.genre.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="discipline">Discipline</Label>
          <Input id="discipline" placeholder="Computer Engineering" {...register("discipline")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="keywords">Keywords</Label>
          <Input id="keywords" placeholder="AI, robotics" {...register("keywords")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register("year")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="volume">Volume</Label>
          <Input id="volume" type="number" {...register("volume")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="number">Issue</Label>
          <Input id="number" type="number" {...register("number")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pages">Pages</Label>
          <Input id="pages" placeholder="12-18" {...register("pages")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="abstract">Abstract</Label>
        <Textarea id="abstract" rows={4} {...register("abstract", { required: "Abstract is required" })} />
        {errors.abstract && <p className="text-sm text-red-600">{errors.abstract.message}</p>}
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-900">Authors</h3>
          <p className="text-sm text-slate-600">List all contributing authors.</p>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Given name</Label>
              <Input
                placeholder="Given name"
                {...register(`authors.${index}.givenName`, { required: "Required" })}
              />
              {errors.authors?.[index]?.givenName && (
                <p className="text-sm text-red-600">
                  {errors.authors?.[index]?.givenName?.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Family name</Label>
              <Input placeholder="Family name" {...register(`authors.${index}.familyName`)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="name@tcioe.edu.np" {...register(`authors.${index}.email`)} />
            </div>
            <div className="space-y-1">
              <Label>Affiliation</Label>
              <Input placeholder="Department, Campus" {...register(`authors.${index}.affiliation`)} />
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Input placeholder="Nepal" {...register(`authors.${index}.country`)} />
            </div>
            {fields.length > 1 && (
              <div className="md:col-span-2 text-right">
                <Button type="button" variant="ghost" onClick={() => remove(index)}>
                  Remove author
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ givenName: "", familyName: "", email: "", affiliation: "", country: "" })
          }
        >
          Add author
        </Button>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-primary-blue/5">
        <h3 className="font-semibold text-slate-900">Campus email verification</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="submittedByName">Your full name</Label>
            <Input id="submittedByName" {...register("submittedByName", { required: "Required" })} />
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
          {isSubmitting ? "Submitting..." : "Submit article"}
        </Button>
      </div>
    </form>
  );
}
