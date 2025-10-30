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
}: {
  token?: string;
  bgColor?: string;
  color?: string;
  jobId: string;
  jobName?: string;
  companyName?: string;
  profileRequirements?: {};
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`${bgColor} ${color} font-semibold hover:bg-opacity-90`}
        >
          Apply
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
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
