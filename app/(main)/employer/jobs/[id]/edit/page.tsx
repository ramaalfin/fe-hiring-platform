"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployerJobFormPage from "../../../_components/EmployerJobFormPage";
import { getEmployerJobByIdFn } from "@/lib/api";

const EditJobPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: jobData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["employerJob", id],
    queryFn: () => getEmployerJobByIdFn(id),
    enabled: !!id,
  });

  const job = jobData?.data;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1 text-neutral-600 hover:text-neutral-900 -ml-2"
        onClick={() => router.push("/employer/jobs")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Edit Job</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update the details for this job opening
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 mt-8">
          <p>Failed to load job details. Please try again.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/employer/jobs")}
          >
            Back to Jobs
          </Button>
        </div>
      ) : job ? (
        <EmployerJobFormPage job={job} />
      ) : null}
    </div>
  );
};

export default EditJobPage;
