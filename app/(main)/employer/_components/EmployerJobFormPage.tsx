"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  employerJobSchema,
  EmployerJobFormValues,
} from "@/schemas/employerJobSchema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import {
  createEmployerJobMutationFn,
  updateEmployerJobMutationFn,
} from "@/lib/api";
import { EmployerJob } from "@/types/api";
import { Loader2 } from "lucide-react";

interface EmployerJobFormPageProps {
  /** When provided, the form operates in edit mode */
  job?: EmployerJob;
}

export default function EmployerJobFormPage({ job }: EmployerJobFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!job;

  const form = useForm<EmployerJobFormValues>({
    resolver: zodResolver(employerJobSchema),
    mode: "onChange",
    defaultValues: {
      jobName: job?.jobName ?? "",
      jobType: job?.jobType ?? "",
      jobDescription: job?.jobDescription ?? "",
      numberOfCandidateNeeded: job?.numberOfCandidateNeeded ?? 1,
      minimumSalary: job?.minimumSalary ?? "",
      maximumSalary: job?.maximumSalary ?? "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EmployerJobFormValues) =>
      isEditing
        ? updateEmployerJobMutationFn(job!.id, data)
        : createEmployerJobMutationFn(data),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: isEditing
          ? "Job updated successfully!"
          : "Job created successfully!",
      });

      await queryClient.invalidateQueries({ queryKey: ["employerJobs"] });

      // Redirect to job list on success
      router.push("/employer/jobs");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to save job",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EmployerJobFormValues) => {
    mutate(values);
  };

  const handleCancel = () => {
    router.push("/employer/jobs");
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 p-6">
            {/* Job Name */}
            <FormField
              control={form.control}
              name="jobName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Frontend Engineer"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Type */}
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description */}
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Describe the role, responsibilities, and requirements..."
                      disabled={isPending}
                      className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number of Candidates */}
            <FormField
              control={form.control}
              name="numberOfCandidateNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Candidates Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimumSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g. 8000000"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maximumSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g. 12000000"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200" />

          {/* Form actions */}
          <div className="flex items-center justify-end gap-3 p-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Publishing..."}
                </>
              ) : isEditing ? (
                "Update Job"
              ) : (
                "Publish Job"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
