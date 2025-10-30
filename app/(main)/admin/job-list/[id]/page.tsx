import React from "react";
import { cookies } from "next/headers";
import DetailJob from "../../_components/DetailJob";

const AdminDetailJobListPage = () => {
  const token = cookies().get("accessToken")?.value;

  return (
    <div className="p-6">
      <DetailJob token={token!} />
    </div>
  );
};

export default AdminDetailJobListPage;
