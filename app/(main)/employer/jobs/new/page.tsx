"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployerJobFormPage from "../../_components/EmployerJobFormPage";

const NewJobPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1 text-neutral-600 hover:text-neutral-900 -ml-2"
        onClick={() => router.push("/employer/jobs")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Create New Job</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Fill in the details below to publish a new job opening
        </p>
      </div>

      <EmployerJobFormPage />
    </div>
  );
};

export default NewJobPage;
