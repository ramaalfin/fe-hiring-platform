"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { ApplicationStatus, EmployerApplication } from "@/types/api";
import ApplicationCard from "./ApplicationCard";

interface ColorConfig {
  bg: string;
  text: string;
  border: string;
}

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: EmployerApplication[];
  colorConfig: ColorConfig;
  onOpen: (application: EmployerApplication) => void;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const KanbanColumn = ({ status, applications, colorConfig, onOpen }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col min-w-[220px] w-[220px] flex-shrink-0">
      {/* Column header */}
      <div
        className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${colorConfig.bg} border ${colorConfig.border}`}
      >
        <span className={`text-sm font-semibold ${colorConfig.text}`}>
          {STATUS_LABELS[status]}
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white bg-opacity-70 ${colorConfig.text}`}
        >
          {applications.length}
        </span>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            aria-label={`${STATUS_LABELS[status]} column`}
            className={`
              flex-1 min-h-[400px] rounded-b-lg border-x border-b p-2 transition-colors duration-150
              ${colorConfig.border}
              ${snapshot.isDraggingOver ? "bg-blue-50" : "bg-neutral-50"}
            `}
          >
            {applications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onOpen={onOpen}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
