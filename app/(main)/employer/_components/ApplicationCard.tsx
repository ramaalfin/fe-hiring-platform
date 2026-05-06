"use client";

import React, { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { EmployerApplication } from "@/types/api";

interface ApplicationCardProps {
  application: EmployerApplication;
  index: number;
  isDragging?: boolean;
  onOpen: (application: EmployerApplication) => void;
}

const ApplicationCard = memo(function ApplicationCard({
  application,
  index,
  onOpen,
}: ApplicationCardProps) {
  const candidateName =
    application.resume?.fullName ||
    application.user?.fullName ||
    "Unknown Candidate";

  const candidateEmail =
    application.resume?.email || application.user?.email || "No email";

  const appliedDate = application.createdAt
    ? format(new Date(application.createdAt), "d MMM yyyy")
    : "Unknown date";

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          role="button"
          tabIndex={0}
          aria-label={`Application from ${candidateName}, status: ${application.status}`}
          onClick={() => {
            if (!snapshot.isDragging) {
              onOpen(application);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(application);
            }
          }}
          className={`
            bg-white rounded-lg border border-neutral-200 p-3 mb-2
            transition-all duration-150
            cursor-grab active:cursor-grabbing
            hover:shadow-md hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            ${
              snapshot.isDragging
                ? "opacity-80 shadow-lg rotate-1 scale-105"
                : ""
            }
          `}
        >
          <p className="font-semibold text-sm text-neutral-900 truncate">
            {candidateName}
          </p>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {candidateEmail}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Applied {appliedDate}</p>
        </div>
      )}
    </Draggable>
  );
});

ApplicationCard.displayName = "ApplicationCard";

export default ApplicationCard;
