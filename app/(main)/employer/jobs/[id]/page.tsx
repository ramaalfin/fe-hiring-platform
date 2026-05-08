"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanBoard from "../../_components/KanbanBoard";
import { getEmployerJobByIdFn } from "@/lib/api";

const EmployerJobDetailPage = () => {
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
    <div className="p-6">
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

      {/* Job header */}
      {isLoading ? (
        <div className="mb-6 space-y-2">
          <div className="h-7 w-64 bg-neutral-200 animate-pulse rounded-md" />
          <div className="h-4 w-40 bg-neutral-100 animate-pulse rounded-md" />
        </div>
      ) : isError ? (
        <div className="mb-6 flex items-center gap-2 text-red-500">
          <Briefcase className="h-5 w-5" />
          <span>Failed to load job details.</span>
        </div>
      ) : job ? (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">{job.jobName}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
            <span>{job.jobType}</span>
            <span>·</span>
            <span>
              Rp{Number(job.minimumSalary).toLocaleString()} –{" "}
              Rp{Number(job.maximumSalary).toLocaleString()}
            </span>
            {job._count !== undefined && (
              <>
                <span>·</span>
                <span>
                  {job._count.applications} applicant
                  {job._count.applications !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Section header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Applications</h2>
        <p className="text-sm text-neutral-500">
          Drag cards between columns to update application status
        </p>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : id ? (
        <KanbanBoard jobId={id} />
      ) : null}
    </div>
  );
};

export default EmployerJobDetailPage;
