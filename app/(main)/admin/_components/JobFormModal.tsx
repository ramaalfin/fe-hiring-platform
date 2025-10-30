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
import JobForm from "./JobForm";

export default function JobFormModal({
  token,
  bgColor = "bg-primary",
  color = "text-black",
  user,
}: {
  token?: string;
  bgColor?: string;
  color?: string;
  user?: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className={`${bgColor} ${color} font-semibold hover:bg-opacity-90`}
        >
          Create a New Job
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Job Opening</DialogTitle>
        </DialogHeader>

        <JobForm token={token} onSuccess={() => setOpen(false)} user={user} />
      </DialogContent>
    </Dialog>
  );
}
