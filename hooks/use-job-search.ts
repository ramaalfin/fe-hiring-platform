"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchJobsQueryFn } from "@/lib/api";
import { Job, PaginationMeta } from "@/types/api";
import { useDebounce } from "@/hooks/use-debounce";

export interface UseJobSearchParams {
    /** Keyword search — debounced internally at 300ms */
    query?: string;
    /** Filter by job type; empty string = no filter */
    jobType?: string;
    /** Filter by minimum salary; 0 = no filter */
    minSalary?: number;
    /** Filter by maximum salary; 0 = no filter */
    maxSalary?: number;
    /** Page number (default: 1) */
    page?: number;
    /** Page size (default: 20) */
    limit?: number;
}

export interface UseJobSearchResult {
    jobs: Job[];
    pagination: PaginationMeta | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useJobSearch(params: UseJobSearchParams): UseJobSearchResult {
    const {
        query = "",
        jobType = "",
        minSalary = 0,
        maxSalary = 0,
        page = 1,
        limit = 20,
    } = params;

    // Debounce the keyword so we don't fire a request on every keystroke
    const debouncedQuery = useDebounce(query, 300);

    // Build the clean params object — omit zero/empty values
    const q = debouncedQuery.trim() || undefined;
    const type = jobType || undefined;
    const min = minSalary > 0 ? minSalary : undefined;
    const max = maxSalary > 0 ? maxSalary : undefined;

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ["jobs", "search", { q, jobType: type, minSalary: min, maxSalary: max, page, limit }],
        queryFn: () =>
            searchJobsQueryFn({
                q,
                jobType: type,
                minSalary: min,
                maxSalary: max,
                page,
                limit,
            }),
        staleTime: 30_000,
        placeholderData: keepPreviousData,
    });

    return {
        jobs: data?.data ?? [],
        pagination: data?.pagination ?? null,
        isLoading,
        isFetching,
        isError,
        error: error as Error | null,
        refetch,
    };
}
