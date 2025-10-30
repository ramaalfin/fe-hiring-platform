import React from "react";
import { cookies } from "next/headers";
import CandidateJobList from "../_components/JobList";

const JobListPage = () => {
  const token = cookies().get("accessToken")?.value;

  return (
    <div className="p-6">
      <CandidateJobList token={token!} />
    </div>
  );
};

export default JobListPage;
