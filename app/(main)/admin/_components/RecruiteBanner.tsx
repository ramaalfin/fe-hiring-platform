import React from "react";
import JobFormModal from "./JobFormModal";

const RecruitBanner = ({ token }: { token?: string }) => {
  return (
    <div
      className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-cover bg-center flex flex-col items-center justify-center text-center p-4"
      style={{ backgroundImage: "url('/assets/images/talking.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Konten */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-white">
        <h1 className="text-lg font-bold">Recruit the best candidates</h1>
        <p className="text-sm font-medium">
          Create jobs, invite, and hire with ease
        </p>
        <JobFormModal token={token} color="text-white" />
      </div>
    </div>
  );
};

export default RecruitBanner;
