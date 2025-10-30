"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllJobsQueryFn } from "@/lib/api";
import ApplyFormModal from "./ApplyFormModal";
import { format } from "date-fns";

interface Job {
  id: string;
  jobName: string;
  jobType: string;
  jobDescription: string;
  numberOfCandidateNeeded: number;
  minimumSalary: string;
  maximumSalary: string;
  createdAt: string;
  createdByUser: {
    email: string;
  };
  minimumProfileInformationRequired: any;
}

const CandidateJobList = ({ token }: { token: string }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => getAllJobsQueryFn(token),
    enabled: !!token,
  });

  const jobs: Job[] = data?.data ?? [];

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    if (!searchKeyword) return jobs;
    const keyword = searchKeyword.toLowerCase();
    return jobs.filter(
      (job) =>
        job.jobName.toLowerCase().includes(keyword) ||
        job.jobDescription.toLowerCase().includes(keyword)
    );
  }, [jobs, searchKeyword]);

  const handleSelectJob = (job: Job) => setSelectedJob(job);

  if (isLoading)
    return <p className="text-center text-gray-500 mt-8">Loading jobs...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500 mt-8">
        Error: {(error as Error).message}
      </p>
    );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search for jobs..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="w-full sm:w-1/2"
      />

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-5 gap-4 mt-4">
          {/* LEFT SECTION - Job List */}
          <div className="col-span-2 space-y-2 overflow-y-auto max-h-[80vh] pr-2">
            {filteredJobs.map((job) => {
              const isActive = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`flex flex-col gap-2 rounded-xl p-4 cursor-pointer transition shadow-md ${
                    isActive
                      ? "bg-[#F7FEFF] border border-primary"
                      : "bg-white border border-neutral-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="space-y-2 flex flex-col">
                    <div className="flex flex-row gap-4 items-start">
                      <Image
                        width={50}
                        height={50}
                        src="/assets/logo/Logo.svg"
                        alt="logo Get Job"
                        className="w-12"
                      />
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-neutral-800">
                          {job.jobName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {job.createdByUser?.email || "Company Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="h-px my-6 border-dashed border border-neutral-40"></div>
                    <span className="text-neutral-90 text-sm">
                      {job.jobType}
                    </span>
                    <span className="text-neutral-90 text-sm">
                      Rp{parseInt(job.minimumSalary).toLocaleString()} - Rp
                      {parseInt(job.maximumSalary).toLocaleString()}
                    </span>
                    <p className="text-xs text-neutral-500">
                      Posted on {format(new Date(job.createdAt), "d MMM yyyy")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SECTION - Job Detail */}
          <div className="col-span-3 border border-neutral-40 p-4 rounded-lg bg-white">
            {selectedJob ? (
              <>
                <div className="flex flex-row justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex flex-row gap-4 items-start">
                      <Image
                        width={50}
                        height={50}
                        src="/assets/logo/Logo.svg"
                        alt="logo Get Job"
                        className="w-12"
                      />
                      <div className="flex flex-col space-y-1">
                        <div className="w-fit bg-primary rounded-md py-1 px-2">
                          <p className="text-white text-sm font-semibold">
                            {selectedJob.jobType}
                          </p>
                        </div>
                        <h3 className="font-semibold text-neutral-800 text-lg">
                          {selectedJob.jobName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {selectedJob.createdByUser?.email || "Company"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ApplyFormModal
                    token={token!}
                    bgColor="bg-secondary"
                    jobId={selectedJob?.id}
                    jobName={selectedJob?.jobName}
                    companyName={selectedJob?.createdByUser?.email}
                    profileRequirements={
                      selectedJob?.minimumProfileInformationRequired
                    }
                  />
                </div>

                <div className="h-px my-4 bg-neutral-40"></div>

                <p className="text-neutral-90 text-sm whitespace-pre-line">
                  {selectedJob.jobDescription}
                </p>
              </>
            ) : (
              <p className="text-neutral-600 text-sm">
                Select a job to view details.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
          <Image
            src="/assets/illustration/Empty State.svg"
            alt="No Data"
            width={1200}
            height={800}
            className="size-60 object-contain"
          />
          <h2 className="text-lg font-semibold text-neutral-90">
            No job openings available
          </h2>
          <p className="text-neutral-90">
            Create a job opening now and start the candidate process.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateJobList;
