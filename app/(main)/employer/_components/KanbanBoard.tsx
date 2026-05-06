"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getEmployerJobApplicationsFn, updateApplicationStatusFn } from "@/lib/api";
import { ApplicationStatus, ApplicationsByStatus, EmployerApplication } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import KanbanColumn from "./KanbanColumn";
import ApplicationDetail from "./ApplicationDetail";

interface KanbanBoardProps {
  jobId: string;
}

const STATUSES: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

const COLOR_CONFIG: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  APPLIED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  SCREENING: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  INTERVIEW: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  OFFER: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  HIRED: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  REJECTED: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
};

/** Returns an ApplicationsByStatus with all 6 statuses initialized to empty arrays */
const emptyBoard = (): ApplicationsByStatus =>
  STATUSES.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as ApplicationsByStatus);

/** Skeleton placeholder shown while loading */
const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {STATUSES.map((status) => (
      <div
        key={status}
        className="min-w-[220px] w-[220px] flex-shrink-0 animate-pulse"
      >
        <div className="h-9 rounded-t-lg bg-neutral-200" />
        <div className="min-h-[400px] rounded-b-lg bg-neutral-100 border border-neutral-200 p-2 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const KanbanBoard = ({ jobId }: KanbanBoardProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modal state
  const [selectedApplication, setSelectedApplication] =
    useState<EmployerApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (application: EmployerApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    // Keep selectedApplication in state briefly so the closing animation
    // can still render the content, then clear it.
    setTimeout(() => setSelectedApplication(null), 200);
  };

  const {
    data: queryData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["employerApplications", jobId],
    queryFn: () => getEmployerJobApplicationsFn(jobId),
    enabled: !!jobId,
  });

  // Local state for optimistic updates
  const [applicationsByStatus, setApplicationsByStatus] =
    useState<ApplicationsByStatus>(emptyBoard);

  // Sync local state when query data changes
  useEffect(() => {
    if (queryData) {
      // Merge query data with empty board to ensure all 6 statuses exist
      setApplicationsByStatus({ ...emptyBoard(), ...queryData });
    }
  }, [queryData]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. Validate drop
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId as ApplicationStatus;
    const newStatus = destination.droppableId as ApplicationStatus;
    const appId = draggableId;

    // Snapshot previous state for potential revert
    const previousState = { ...applicationsByStatus };
    const appToMove = applicationsByStatus[sourceStatus].find(
      (a) => a.id === appId
    );
    if (!appToMove) return;

    // 2. Optimistic update — move card to new column immediately
    setApplicationsByStatus((prev) => {
      const updated = { ...prev };
      updated[sourceStatus] = updated[sourceStatus].filter((a) => a.id !== appId);
      updated[newStatus] = [
        ...updated[newStatus],
        { ...appToMove, status: newStatus },
      ];
      return updated;
    });

    // 3. API call
    try {
      await updateApplicationStatusFn(appId, newStatus);

      // 4. On success: invalidate query to sync with server
      queryClient.invalidateQueries({
        queryKey: ["employerApplications", jobId],
      });
    } catch (error: any) {
      // 5. On error: revert to previous state and show toast
      setApplicationsByStatus(previousState);

      const message =
        error?.message ||
        `Cannot move application to ${newStatus}`;

      toast({
        title: "Status update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <KanbanSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-red-500 font-medium">
          Failed to load applications. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Refetch loading indicator — shown during background refreshes */}
      {isFetching && !isLoading && (
        <div
          className="flex items-center gap-2 text-sm text-neutral-500 mb-3"
          aria-live="polite"
          aria-label="Refreshing applications"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Refreshing…</span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applicationsByStatus[status] ?? []}
            colorConfig={COLOR_CONFIG[status]}
            onOpen={handleOpenDetail}
          />
        ))}
      </div>

      <ApplicationDetail
        application={selectedApplication}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onStatusChange={(appId, newStatus) => {
          // Update local optimistic state so the board reflects the change
          setApplicationsByStatus((prev) => {
            const updated = { ...prev };
            let movedApp: EmployerApplication | undefined;

            // Remove from all columns
            for (const s of STATUSES) {
              const idx = updated[s].findIndex((a) => a.id === appId);
              if (idx !== -1) {
                movedApp = { ...updated[s][idx], status: newStatus };
                updated[s] = updated[s].filter((a) => a.id !== appId);
                break;
              }
            }

            // Add to new column
            if (movedApp) {
              updated[newStatus] = [...updated[newStatus], movedApp];
            }

            return updated;
          });

          // Also update the selected application so the modal reflects the new status
          setSelectedApplication((prev) =>
            prev ? { ...prev, status: newStatus } : prev
          );
        }}
      />
    </DragDropContext>
  );
};

export default KanbanBoard;
