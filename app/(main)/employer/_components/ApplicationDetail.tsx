"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  X,
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  getApplicationStatusHistoryFn,
  updateApplicationNotesFn,
  updateApplicationStatusFn,
} from "@/lib/api";
import {
  ApplicationStatus,
  ApplicationStatusHistory,
  EmployerApplication,
} from "@/types/api";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  SCREENING: "bg-yellow-100 text-yellow-700",
  INTERVIEW: "bg-purple-100 text-purple-700",
  OFFER: "bg-orange-100 text-orange-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

/* ─────────────────────────────────────────────
   Props
───────────────────────────────────────────── */

interface ApplicationDetailProps {
  application: EmployerApplication | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful status change so the board can refresh */
  onStatusChange?: (appId: string, newStatus: ApplicationStatus) => void;
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

const HistorySkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-3">
        <Skeleton className="h-4 w-4 rounded-full mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */

const ApplicationDetail = ({
  application,
  isOpen,
  onClose,
  onStatusChange,
}: ApplicationDetailProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Local notes state (editable)
  const [notes, setNotes] = useState(application?.notes ?? "");

  // Sync notes when application changes
  useEffect(() => {
    setNotes(application?.notes ?? "");
  }, [application?.id, application?.notes]);

  // Focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Escape key closes the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap — keep Tab/Shift+Tab cycling within the modal
  useEffect(() => {
    if (!isOpen) return;

    const modalEl = overlayRef.current?.querySelector(
      '[role="document"]'
    ) as HTMLElement | null;
    if (!modalEl) return;

    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = Array.from(
        modalEl.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.closest('[aria-hidden="true"]'));

      if (focusableElements.length === 0) return;

      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── Status history query ── */
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = useQuery<ApplicationStatusHistory[]>({
    queryKey: ["applicationHistory", application?.id],
    queryFn: () => getApplicationStatusHistoryFn(application!.id),
    enabled: isOpen && !!application?.id,
    staleTime: 30_000,
  });

  /* ── Status update mutation ── */
  const statusMutation = useMutation({
    mutationFn: (newStatus: ApplicationStatus) =>
      updateApplicationStatusFn(application!.id, newStatus),
    onSuccess: (updated) => {
      toast({
        title: "Status updated",
        description: `Application moved to ${STATUS_LABELS[updated.status]}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["applicationHistory", application!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["employerApplications", application!.jobId],
      });
      onStatusChange?.(application!.id, updated.status);
    },
    onError: (error: any) => {
      toast({
        title: "Status update failed",
        description: error?.message ?? "Could not update application status.",
        variant: "destructive",
      });
    },
  });

  /* ── Notes save mutation ── */
  const notesMutation = useMutation({
    mutationFn: () => updateApplicationNotesFn(application!.id, notes),
    onSuccess: () => {
      toast({ title: "Notes saved", description: "Notes updated successfully." });
      queryClient.invalidateQueries({
        queryKey: ["employerApplications", application!.jobId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save notes",
        description: error?.message ?? "Could not save notes.",
        variant: "destructive",
      });
    },
  });

  /* ── Derived values ── */
  const candidateName =
    application?.resume?.fullName ||
    application?.user?.fullName ||
    "Unknown Candidate";

  const candidateEmail =
    application?.resume?.email || application?.user?.email || "—";

  const candidatePhone = application?.resume?.phoneNumber ?? null;
  const resumeLink = application?.resume?.linkedinLink ?? null;
  const currentStatus = application?.status ?? "APPLIED";
  const availableTransitions = VALID_TRANSITIONS[currentStatus] ?? [];

  /* ── Render nothing when closed ── */
  if (!isOpen || !application) return null;

  /* ── Overlay click closes modal ── */
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Application details for ${candidateName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleOverlayClick}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        role="document"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-neutral-900">
            Application Details
          </h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label="Close application details"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Candidate Info ── */}
          <section aria-labelledby="candidate-info-heading">
            <h3
              id="candidate-info-heading"
              className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3"
            >
              Candidate
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span className="font-semibold text-neutral-900">
                  {candidateName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                <span className="text-sm text-neutral-700">{candidateEmail}</span>
              </div>
              {candidatePhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{candidatePhone}</span>
                </div>
              )}
              {resumeLink && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <a
                    href={resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    aria-label="View resume (opens in new tab)"
                  >
                    View Resume
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* ── Current Status & Status Change ── */}
          <section aria-labelledby="status-heading">
            <h3
              id="status-heading"
              className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3"
            >
              Status
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Current:</span>
                <StatusBadge status={currentStatus} />
              </div>

              {availableTransitions.length > 0 && (
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-neutral-400 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="status-select"
                      className="text-sm text-neutral-600 whitespace-nowrap"
                    >
                      Move to:
                    </label>
                    <Select
                      onValueChange={(value) =>
                        statusMutation.mutate(value as ApplicationStatus)
                      }
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger
                        id="status-select"
                        className="w-[160px] h-8 text-sm"
                        aria-label="Change application status"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {statusMutation.isPending && (
                      <Loader2
                        className="h-4 w-4 animate-spin text-neutral-400"
                        aria-label="Updating status…"
                      />
                    )}
                  </div>
                </div>
              )}

              {availableTransitions.length === 0 && (
                <span className="text-xs text-neutral-400 italic">
                  No further transitions available
                </span>
              )}
            </div>
          </section>

          <Separator />

          {/* ── Status History ── */}
          <section aria-labelledby="history-heading">
            <h3
              id="history-heading"
              className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3"
            >
              Status History
            </h3>

            {historyLoading && <HistorySkeleton />}

            {historyError && (
              <p className="text-sm text-red-500">
                Failed to load status history.
              </p>
            )}

            {!historyLoading && !historyError && (!history || history.length === 0) && (
              <p className="text-sm text-neutral-400 italic">
                No status changes recorded yet.
              </p>
            )}

            {!historyLoading && !historyError && history && history.length > 0 && (
              <ol
                aria-label="Status change history"
                className="relative border-l border-neutral-200 ml-2 space-y-4"
              >
                {history.map((entry) => (
                  <li key={entry.id} className="ml-4">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-neutral-400" />
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <StatusBadge status={entry.fromStatus} />
                      <ChevronRight className="h-3 w-3 text-neutral-400" />
                      <StatusBadge status={entry.toStatus} />
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <time dateTime={entry.changedAt}>
                        {format(new Date(entry.changedAt), "d MMM yyyy, HH:mm")}
                      </time>
                      {entry.changedByUser?.fullName && (
                        <span>· by {entry.changedByUser.fullName}</span>
                      )}
                    </div>
                    {entry.reason && (
                      <p className="mt-1 text-xs text-neutral-500 italic">
                        "{entry.reason}"
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <Separator />

          {/* ── Notes ── */}
          <section aria-labelledby="notes-heading">
            <h3
              id="notes-heading"
              className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3"
            >
              Notes
            </h3>
            <textarea
              id="application-notes"
              aria-label="Application notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this candidate…"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={() => notesMutation.mutate()}
                disabled={notesMutation.isPending}
                aria-label="Save notes"
              >
                {notesMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Saving…
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
