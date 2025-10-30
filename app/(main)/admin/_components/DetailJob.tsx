"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getApplicationsByAdminFn } from "@/lib/api";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { formatDate } from "@/utils/formatDate";

interface Candidate {
  id: string;
  fullName: string;
  gender: string;
  domicile: string;
  email: string;
  phoneNumber: string;
  linkedinLink: string;
  dateOfBirth: string;
  jobId: string;
  jobName: string;
  createdAt: string;
  resume: any;
  applicant: any;
}

export default function DetailJob({ token }: { token?: string }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const adminId = pathSegments[pathSegments.length - 1];

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Candidate>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateSortOrder, setDateSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const limit = 5;

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["adminApplications", adminId],
    queryFn: () => getApplicationsByAdminFn(adminId!, token!),
  });

  const filteredData = useMemo(() => {
    let data = candidates;

    // search filter
    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter((item: any) =>
        item.applicant.fullName.toLowerCase().includes(keyword)
      );
    }

    // sort
    data = [...data].sort((a, b) => {
      if (sortField === "createdAt") {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return dateSortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aVal = a.applicant[sortField];
      const bVal = b.applicant[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return data;
  }, [candidates, search, sortField, sortOrder, dateSortOrder]);

  // pagination
  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item: any) => selectedIds.includes(item.applicant.id));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedData.map((item: any) => item.applicant.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleSort = (field: keyof Candidate) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-bold">Job Applicants</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <Image
            src="/assets/illustration/Empty Candidate.svg"
            alt="No Data"
            width={400}
            height={300}
          />
          <p className="text-gray-500 mt-4">No candidate found</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <Input
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />

            <Select
              value={dateSortOrder}
              onValueChange={(val) => setDateSortOrder(val as "asc" | "desc")}
            >
              <SelectTrigger className="w-[180px]">
                {dateSortOrder === "desc" ? "Latest" : "Oldest"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Latest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredData.length > 0 ? (
            <>
              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(checked) =>
                            toggleSelectAll(checked === true)
                          }
                        />
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort("fullName")}
                        className="cursor-pointer"
                      >
                        Full Name{" "}
                        {sortField === "fullName"
                          ? sortOrder === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </TableHead>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Domicile</TableHead>
                      <TableHead
                        onClick={() => handleSort("gender")}
                        className="cursor-pointer"
                      >
                        Gender{" "}
                        {sortField === "gender"
                          ? sortOrder === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </TableHead>
                      <TableHead>LinkedIn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((candidate: any) => (
                      <TableRow key={candidate.applicant.id}>
                        <TableCell className="w-10">
                          <Checkbox
                            checked={selectedIds.includes(
                              candidate.applicant.id
                            )}
                            onCheckedChange={(checked) =>
                              toggleSelect(
                                candidate.applicant.id,
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {candidate.resume.fullName || "-"}
                        </TableCell>
                        <TableCell>{candidate.resume.email || "-"}</TableCell>
                        <TableCell>
                          {formatPhoneNumber(candidate.resume.phoneNumber) ||
                            "-"}
                        </TableCell>
                        <TableCell>
                          {formatDate(candidate.resume.dateOfBirth) || "-"}
                        </TableCell>
                        <TableCell>
                          {candidate.resume.domicile || "-"}
                        </TableCell>
                        <TableCell>{candidate.resume.gender || "-"}</TableCell>
                        <TableCell>
                          {candidate.resume.linkedinLink ? (
                            <a
                              href={candidate.resume.linkedinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {candidate.resume.linkedinLink}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-end gap-4 mt-4 items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className=" p-4 flex justify-center mx-auto w-full">
              <p className="text-sm">No data</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
