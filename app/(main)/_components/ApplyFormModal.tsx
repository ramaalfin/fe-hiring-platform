"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApplyForm from "./ApplyForm";

export default function ApplyFormModal({
  token,
  bgColor = "bg-primary",
  color = "text-black",
  jobId,
  jobName,
  companyName,
  profileRequirements,
  hasApplied,
}: {
  token?: string;
  bgColor?: string;
  color?: string;
  jobId: string;
  jobName?: string;
  companyName?: string;
  profileRequirements?: {};
  hasApplied?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={hasApplied}
          className={`${
            hasApplied
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          }`}
        >
          {hasApplied ? "Already Applied" : "Apply Now"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-96 lg:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Apply {jobName}</DialogTitle>
        </DialogHeader>

        <ApplyForm
          jobId={jobId}
          token={token}
          profileRequirements={profileRequirements}
        />
      </DialogContent>
    </Dialog>
  );
}
