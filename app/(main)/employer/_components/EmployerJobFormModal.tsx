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
import EmployerJobForm from "./EmployerJobForm";
import { EmployerJob } from "@/types/api";
import { Plus, Pencil } from "lucide-react";

interface EmployerJobFormModalProps {
  /** When provided, the modal operates in edit mode */
  job?: EmployerJob;
  /** Override the trigger button entirely */
  trigger?: React.ReactNode;
}

export default function EmployerJobFormModal({
  job,
  trigger,
}: EmployerJobFormModalProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!job;

  const defaultTrigger = isEditing ? (
    <Button variant="outline" size="sm" className="gap-1">
      <Pencil className="h-3.5 w-3.5" />
      Edit
    </Button>
  ) : (
    <Button variant="default" className="gap-1 font-semibold">
      <Plus className="h-4 w-4" />
      Create Job
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            {isEditing ? "Edit Job" : "Create New Job"}
          </DialogTitle>
        </DialogHeader>

        <EmployerJobForm job={job} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
