"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, ChevronDown } from "lucide-react";
import KanbanBoard from "../_components/KanbanBoard";
import { getAllJobsQueryFn } from "@/lib/api";
import { useAuthContext } from "@/context/auth-provider";
import Cookies from "js-cookie";

interface EmployerJob {
  id: string;
  jobName: string;
  jobType: string;
  _count?: { applications: number };
}

const EmployerDashboardPage = () => {
  const { user } = useAuthContext();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const token = Cookies.get("access_token") || "";

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: () => getAllJobsQueryFn(token),
    enabled: !!token,
  });

  // Filter jobs that belong to this employer
  const employerJobs: EmployerJob[] = (jobsData?.data ?? []).filter(
    (job: any) => job.employerId === user?.id
  );

  const selectedJob = employerJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Employer Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your job applications with the kanban board
        </p>
      </div>

      {/* Job selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select a Job to View Applications
        </label>

        {jobsLoading ? (
          <div className="h-10 w-64 bg-neutral-200 animate-pulse rounded-md" />
        ) : employerJobs.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3">
            <Briefcase className="h-4 w-4" />
            <span>No jobs found. Create a job to get started.</span>
          </div>
        ) : (
          <div className="relative inline-block">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-white border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition min-w-[280px] justify-between"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              <span className="truncate">
                {selectedJob ? selectedJob.jobName : "Choose a job…"}
              </span>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-neutral-400" />
            </button>

            {isDropdownOpen && (
              <ul
                role="listbox"
                className="absolute z-10 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {employerJobs.map((job) => (
                  <li
                    key={job.id}
                    role="option"
                    aria-selected={job.id === selectedJobId}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-neutral-50 flex items-center justify-between ${
                      job.id === selectedJobId
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-neutral-700"
                    }`}
                  >
                    <span className="truncate">{job.jobName}</span>
                    {job._count?.applications !== undefined && (
                      <span className="ml-2 text-xs text-neutral-400 flex-shrink-0">
                        {job._count.applications} applicant
                        {job._count.applications !== 1 ? "s" : ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Kanban board */}
      {selectedJobId ? (
        <KanbanBoard jobId={selectedJobId} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-50 border border-dashed border-neutral-300 rounded-xl text-neutral-400">
          <Briefcase className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Select a job above to view its kanban board</p>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboardPage;
