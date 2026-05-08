"use client";

import { memo, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { Briefcase, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { getEmployerJobsFn, deleteEmployerJobMutationFn } from "@/lib/api";
import { EmployerJob } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";
import EmployerJobFormModal from "./EmployerJobFormModal";

/* ─── Job Card ─────────────────────────────────────────────────────────────── */

const JobCard = memo(({ job }: { job: EmployerJob }) => {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutate: deleteJob, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteEmployerJobMutationFn(job.id),
    onSuccess: async () => {
      toast({ title: "Job deleted", description: `"${job.jobName}" has been removed.` });
      setDeleteOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["employerJobs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 shadow-md bg-white border border-neutral-200 transition hover:shadow-lg">
      {/* Date badge */}
      <div className="border border-neutral-200 w-fit rounded-md">
        <p className="text-xs text-neutral-500 px-2 py-1">
          Created {format(new Date(job.createdAt), "d MMM yyyy")}
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-row justify-between items-start gap-4">
        <div className="space-y-1 min-w-0">
          <h3 className="font-semibold text-neutral-800 truncate">{job.jobName}</h3>
          <p className="text-sm text-neutral-500">{job.jobType}</p>
          <p className="text-sm text-neutral-600">
            Rp{Number(job.minimumSalary).toLocaleString()} –{" "}
            Rp{Number(job.maximumSalary).toLocaleString()}
          </p>
          {job._count !== undefined && (
            <p className="text-xs text-neutral-400">
              {job._count.applications} applicant
              {job._count.applications !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/employer/jobs/${job.id}`}>
            <Button variant="default" size="sm" className="gap-1" aria-label={`View applications for ${job.jobName}`}>
              <Eye className="h-3.5 w-3.5" />
              View Applications
            </Button>
          </Link>

          <EmployerJobFormModal job={job} />

          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(true)}
            aria-label={`Delete job ${job.jobName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete job?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{job.jobName}&quot; and all its
              associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteJob()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

JobCard.displayName = "JobCard";

/* ─── Job List ──────────────────────────────────────────────────────────────── */

export default function EmployerJobList() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const debouncedSearch = useDebounce(searchKeyword, 300);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["employerJobs"],
    queryFn: () => getEmployerJobsFn(),
    staleTime: 5 * 60 * 1000,
  });

  const filteredAndSortedJobs = useMemo(() => {
    if (!data?.data) return [];

    let jobs = [...data.data];

    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.jobName.toLowerCase().includes(lower) ||
          job.jobDescription?.toLowerCase().includes(lower)
      );
    }

    switch (sortBy) {
      case "date-asc":
        jobs.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "date-desc":
        jobs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "min-salary":
        jobs.sort((a, b) => Number(a.minimumSalary) - Number(b.minimumSalary));
        break;
      case "max-salary":
        jobs.sort((a, b) => Number(b.maximumSalary) - Number(a.maximumSalary));
        break;
    }

    return jobs;
  }, [data, debouncedSearch, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-neutral-100 animate-pulse border border-neutral-200"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 mt-8">
        Error: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Input
          aria-label="Search jobs by title or description"
          placeholder="Search by job title or description"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full sm:w-1/2"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger aria-label="Sort jobs by" className="w-full sm:w-[180px]">
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

      {/* Job cards */}
      <div className="grid gap-4 mt-4">
        {filteredAndSortedJobs.length > 0 ? (
          filteredAndSortedJobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100">
              <Briefcase className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {debouncedSearch ? "No jobs match your search" : "No job openings yet"}
            </h2>
            <p className="text-neutral-500 text-sm max-w-xs">
              {debouncedSearch
                ? "Try a different keyword or clear the search."
                : "Create your first job opening to start receiving applications."}
            </p>
            {!debouncedSearch && <EmployerJobFormModal />}
          </div>
        )}
      </div>
    </div>
  );
}
