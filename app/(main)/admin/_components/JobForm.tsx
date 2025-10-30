"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormValues } from "@/schemas/jobSchema";
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
import { createJobMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function JobForm({
  token,
  onSuccess,
  user,
}: {
  token?: string;
  onSuccess?: () => void;
  user?: any;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: JobFormValues) => createJobMutationFn(data, token!),
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Job berhasil dibuat!",
      });

      // Pastikan invalidasi dan refetch benar-benar selesai
      await queryClient.invalidateQueries({
        queryKey: ["adminJobs", user?.id],
      });

      await queryClient.refetchQueries({
        queryKey: ["adminJobs", user?.id],
      });

      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Gagal membuat pekerjaan",
        variant: "destructive",
      });
    },
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    mode: "onChange",
    defaultValues: {
      jobName: "",
      jobType: "",
      jobDescription: "",
      numberOfCandidateNeeded: 1,
      minimumSalary: "",
      maximumSalary: "",
      minimumProfileInformationRequired: {
        fullName: "mandatory",
        photoProfile: "optional",
        gender: "off",
        domicile: "off",
        email: "mandatory",
        phoneNumber: "optional",
        linkedinLink: "off",
        dateOfBirth: "off",
      },
    },
  });

  const profileFields = [
    { key: "fullName", label: "Full Name" },
    { key: "photoProfile", label: "Photo Profile" },
    { key: "gender", label: "Gender" },
    { key: "domicile", label: "Domicile" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "linkedinLink", label: "LinkedIn Link" },
    { key: "dateOfBirth", label: "Date of Birth" },
  ] as const;

  const profileOptions = [
    { value: "mandatory", label: "Mandatory" },
    { value: "optional", label: "Optional" },
    { value: "off", label: "Off" },
  ];

  const onSubmit = (values: JobFormValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="space-y-6 p-4">
          <FormField
            control={form.control}
            name="jobName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Name</FormLabel>
                <FormControl>
                  <Input placeholder="Frontend Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
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

          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description (min. 10 karakter)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Describe job responsibilities..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfCandidateNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Candidates Needed</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minimumSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Salary</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="8000000" {...field} />
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
                    <Input type="text" placeholder="12000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Profile Requirements */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">
              Minimum Profile Information Required
            </h2>

            <div className="grid gap-6">
              {profileFields.map((fieldData) => (
                <FormField
                  key={fieldData.key}
                  control={form.control}
                  name={`minimumProfileInformationRequired.${fieldData.key}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row justify-between items-center">
                      <FormLabel>{fieldData.label}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {profileOptions.map((opt) => {
                            const isSelected = field.value === opt.value;
                            return (
                              <Button
                                key={opt.value}
                                type="button"
                                variant="outline"
                                onClick={() => field.onChange(opt.value)}
                                className={cn(
                                  "rounded-full px-4 py-1 text-sm border transition-colors",
                                  isSelected
                                    ? "border-primary text-primary bg-white"
                                    : "border-gray-300 text-gray-500 bg-gray-100 hover:bg-gray-200"
                                )}
                              >
                                {opt.label}
                              </Button>
                            );
                          })}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-30 mt-4"></div>

        <div className="p-4">
          <Button
            type="submit"
            disabled={
              isPending || !form.formState.isValid || !form.formState.isDirty
            }
            className={cn(
              "w-fit font-semibold flex items-center ml-auto hover:bg-opacity-90",
              isPending || !form.formState.isValid || !form.formState.isDirty
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            {isPending ? "Menyimpan..." : "Publish Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
