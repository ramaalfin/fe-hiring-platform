"use client";

import Image from "next/image";
import { format } from "date-fns";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Job, PaginationMeta } from "@/types/api";

interface JobResultsDisplayProps {
  /** The list of jobs to display */
  jobs: Job[];
  /** Pagination metadata (null when not yet loaded) */
  pagination: PaginationMeta | null;
  /** True on initial load (show skeleton cards) */
  isLoading: boolean;
  /** True when re-fetching (show subtle opacity) */
  isFetching: boolean;
  /** True when an error occurred */
  isError: boolean;
  /** The error object if isError is true */
  error: Error | null;
  /** Currently selected job id (for highlighting) */
  selectedJobId?: string | null;
  /** Called when a job card is clicked */
  onSelectJob: (job: Job) => void;
  /** Current page number */
  page: number;
  /** Called when user navigates to a different page */
  onPageChange: (page: number) => void;
  /** Called when user clicks the retry button on error */
  onRetry?: () => void;
}

/** Skeleton placeholder that mimics the shape of a real job card */
const JobCardSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-neutral-200 shadow-md">
    <div className="flex flex-row gap-4 items-start">
      {/* Logo placeholder */}
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        {/* Title line */}
        <Skeleton className="h-4 w-3/4 rounded" />
        {/* Company line */}
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
    {/* Divider */}
    <Skeleton className="h-px w-full my-2 rounded" />
    {/* Job type line */}
    <Skeleton className="h-3 w-1/3 rounded" />
    {/* Salary line */}
    <Skeleton className="h-3 w-2/3 rounded" />
    {/* Date line */}
    <Skeleton className="h-3 w-1/2 rounded" />
  </div>
);

const JobResultsDisplay = ({
  jobs,
  pagination,
  isLoading,
  isFetching,
  isError,
  error,
  selectedJobId,
  onSelectJob,
  page,
  onPageChange,
  onRetry,
}: JobResultsDisplayProps) => {
  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load jobs</AlertTitle>
            <AlertDescription>
              {error?.message ?? "An unexpected error occurred. Please try again."}
            </AlertDescription>
          </Alert>
          {onRetry && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
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
        <p className="text-neutral-90">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Result count */}
      {pagination && (
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
        >
          {pagination.total} job{pagination.total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Background re-fetch indicator */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          <span>Refreshing...</span>
        </div>
      )}

      {/* Job cards list */}
      <div
        className={`space-y-2 overflow-y-auto max-h-[80vh] pr-2 ${
          isFetching ? "opacity-70 transition-opacity" : ""
        }`}
      >
        {jobs.map((job) => {
          const isActive = selectedJobId === job.id;
          return (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectJob(job)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectJob(job);
                }
              }}
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
                <span className="text-neutral-90 text-sm">{job.jobType}</span>
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

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={!pagination.hasPrevPage || isFetching}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!pagination.hasNextPage || isFetching}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobResultsDisplay;
