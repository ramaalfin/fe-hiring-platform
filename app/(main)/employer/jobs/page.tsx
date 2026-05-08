import React from "react";
import EmployerJobList from "../_components/EmployerJobList";
import EmployerJobFormModal from "../_components/EmployerJobFormModal";

const EmployerJobsPage = () => {
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Jobs</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your job openings and review applications
          </p>
        </div>
        <EmployerJobFormModal />
      </div>

      <EmployerJobList />
    </div>
  );
};

export default EmployerJobsPage;
