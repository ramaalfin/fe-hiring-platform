"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getAdminJobsFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import JobFormModal from "./JobFormModal";
import { useAuthContext } from "@/context/auth-provider";

const JobList = ({ token }: { token: string }) => {
  const { user, isLoading: isUserLoading } = useAuthContext();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Ambil data pekerjaan milik admin
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminJobs", user?.email],
    queryFn: () => getAdminJobsFn(user!.id, token!),
    enabled: !!user?.id && !!token && !isUserLoading,
    refetchOnMount: "always",
  });

  const filteredAndSortedJobs = useMemo(() => {
    if (!data) return [];

    let jobs = [...data];

    // Filter berdasarkan keyword
    if (searchKeyword) {
      const lowerKeyword = searchKeyword.toLowerCase();
      jobs = jobs.filter(
        (job: any) =>
          job.jobName.toLowerCase().includes(lowerKeyword) ||
          job.jobDescription?.toLowerCase().includes(lowerKeyword)
      );
    }

    // Urutkan berdasarkan kriteria
    switch (sortBy) {
      case "date-asc":
        jobs.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "date-desc":
        jobs.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "min-salary":
        jobs.sort((a: any, b: any) => a.minimumSalary - b.minimumSalary);
        break;
      case "max-salary":
        jobs.sort((a: any, b: any) => b.maximumSalary - a.maximumSalary);
        break;
    }

    return jobs;
  }, [data, searchKeyword, sortBy]);

  // Loading state (user / data)
  if (isUserLoading || isLoading)
    return <p className="text-center text-gray-500 mt-8">Loading jobs...</p>;

  if (isError)
    return (
      <p className="text-center text-red-500 mt-8">
        Error: {(error as Error).message}
      </p>
    );

  return (
    <div className="space-y-4">
      {/* Filter dan Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Input
          placeholder="Search by job title or description"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full sm:w-1/2"
        />

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest</SelectItem>
            <SelectItem value="date-asc">Oldest</SelectItem>
            <SelectItem value="min-salary">Lowest Salary</SelectItem>
            <SelectItem value="max-salary">Highest Salary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Daftar Job */}
      <div className="grid gap-4 mt-4">
        {filteredAndSortedJobs.length > 0 &&
          filteredAndSortedJobs.map((job: any) => (
            <div
              key={job.id}
              className="flex flex-col gap-2 rounded-xl p-4 transition shadow-md bg-white border border-neutral-200"
            >
              <div className="border border-neutral-40 w-fit rounded-md">
                {job.createdAt && (
                  <p className="text-sm text-neutral-90 p-2">
                    started on {format(new Date(job.createdAt), "d MMM yyyy")}
                  </p>
                )}
              </div>

              <div className="flex flex-row justify-between items-center">
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-800">
                    {job.jobName}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Rp{job.minimumSalary.toLocaleString()} – Rp
                    {job.maximumSalary.toLocaleString()}
                  </p>
                </div>

                <Link href={`/admin/job-list/${job.id}`}>
                  <Button
                    variant="default"
                    className="bg-primary text-white hover:bg-opacity-90"
                  >
                    Manage Job
                  </Button>
                </Link>
              </div>
            </div>
          ))}

        {/* Empty State */}
        {(!data || filteredAndSortedJobs.length === 0) && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <Image
              src="/assets/illustration/Empty State.svg"
              alt="No Data"
              width={1200}
              height={800}
              className="size-60 object-contain"
            />
            <h2 className="text-lg font-semibold text-neutral-900">
              No job openings available
            </h2>
            <p className="text-neutral-700">
              Create a job opening now and start the candidate process.
            </p>

            <JobFormModal token={token!} bgColor="bg-secondary" user={user!} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
