import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isDetailPage =
    pathSegments.length === 3 &&
    pathSegments[0] === "admin" &&
    pathSegments[1] === "job-list";
  const lastSegment = pathSegments.pop();

  // Clear characters like hyphen or underscore
  const formattedSegment = lastSegment
    ?.replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const breadcrumb = isDetailPage ? (
    <div className="flex items-center gap-2">
      <div className="bg-white border-2 border-neutral-40 px-4 p-1 rounded-md">
        <span className="text-neutral-1000 text-sm font-semibold">
          Job List
        </span>
      </div>
      <span className="text-neutral-1000">
        <ChevronRight />
      </span>
      <div className="bg-neutral-30 border-2 border-neutral-40 px-4 p-1 rounded-md">
        <span className="text-neutral-1000 text-sm font-semibold">
          Manage Candidate
        </span>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full">
      <div className="flex h-[60px] items-center border-b border-[#00002f26] px-2 space-x-4">
        <SidebarTrigger className="ml-1" />
        {isDetailPage ? (
          <div>{breadcrumb}</div>
        ) : (
          <h1 className="ml-4 text-lg font-semibold capitalize">
            {formattedSegment}
          </h1>
        )}
      </div>
    </div>
  );
};

export default Header;
