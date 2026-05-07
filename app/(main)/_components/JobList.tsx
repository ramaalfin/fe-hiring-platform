"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useJobSearch } from "@/hooks/use-job-search";
import ApplyFormModal from "./ApplyFormModal";
import JobResultsDisplay from "./JobResultsDisplay";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchInput from "@/app/(main)/employer/_components/SearchInput";
import FilterPanel, { FilterValues } from "@/app/(main)/employer/_components/FilterPanel";
import { Job } from "@/types/api";

const EMPTY_FILTERS: FilterValues = {
  jobType: "",
  minSalary: 0,
  maxSalary: 0,
};

const CandidateJobList = ({ token }: { token: string }) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Search / filter / pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  const { jobs, pagination, isLoading, isFetching, isError, error, refetch } = useJobSearch({
    query: searchQuery,
    jobType: filters.jobType,
    minSalary: filters.minSalary,
    maxSalary: filters.maxSalary,
    page,
    limit: 20,
  });

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterApply = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const JobDetail = ({ job }: { job: Job }) => (
    <>
      <div className="flex flex-row justify-between items-start gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex flex-row gap-4 items-start">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col space-y-2 flex-1">
              <span className="inline-flex items-center w-fit px-3 py-1 rounded-md text-xs font-semibold bg-primary text-primary-foreground">
                {job.jobType}
              </span>
              <h3 className="font-bold text-foreground text-xl">
                {job.jobName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {job.createdByUser?.email || "Company"}
              </p>
            </div>
          </div>
        </div>

        <ApplyFormModal
          token={token}
          bgColor="bg-secondary"
          jobId={String(selectedJob?.id)}
          jobName={selectedJob?.jobName}
          companyName={selectedJob?.createdByUser?.email}
          profileRequirements={selectedJob?.minimumProfileInformationRequired}
          hasApplied={selectedJob?.hasApplied}
        />
      </div>

      <div className="h-px my-4 bg-border"></div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-neutral-90">
          <DollarSign className="w-5 h-5" />
          <span className="font-semibold">
            Rp{parseInt(job.minimumSalary).toLocaleString()} - Rp
            {parseInt(job.maximumSalary).toLocaleString()}
          </span>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-neutral-90 whitespace-pre-line leading-relaxed">
            {job.jobDescription}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Search for jobs..."
            debounceMs={300}
          />
        </div>
      </div>

      <FilterPanel onApply={handleFilterApply} />

      {/* Left/right layout when jobs are available, or full-width display states */}
      {!isLoading && !isError && jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
          {/* LEFT SECTION - Job Results */}
          <div className="col-span-2">
            <JobResultsDisplay
              jobs={jobs}
              pagination={pagination}
              isLoading={isLoading}
              isFetching={isFetching}
              isError={isError}
              error={error as Error | null}
              selectedJobId={selectedJob?.id}
              onSelectJob={handleSelectJob}
              page={page}
              onPageChange={setPage}
              onRetry={refetch}
            />
          </div>

          {/* RIGHT SECTION - Job Detail */}
          <div className="hidden lg:block col-span-3 border border-neutral-40 p-4 rounded-lg bg-white">
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
                    token={token}
                    bgColor="bg-secondary"
                    jobId={selectedJob.id}
                    jobName={selectedJob.jobName}
                    companyName={selectedJob.createdByUser?.email}
                    profileRequirements={
                      selectedJob.minimumProfileInformationRequired
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
        <JobResultsDisplay
          jobs={jobs}
          pagination={pagination}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error as Error | null}
          selectedJobId={selectedJob?.id}
          onSelectJob={handleSelectJob}
          page={page}
          onPageChange={setPage}
          onRetry={refetch}
        />
      )}

      {/* Mobile drawer for job detail */}
      {isMobile && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-bold">
                  Job Details
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDrawer}
                    className="h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="p-4 overflow-y-auto">
              {selectedJob && <JobDetail job={selectedJob} />}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default CandidateJobList;
