import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronsRight, ChevronsLeft } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

// Generate page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  // Left ellipsis
  if (current > 3) {
    pages.push("...");
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (current < total - 2) {
    pages.push("...");
  }

  // Always show last page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="flex justify-center fixed-bottom opacity-75 mb-10">
      <ul className="flex justify-center items-center space-x-2 mt-5">
        {/* Previous Button */}
        {page > 1 && (
          <li key="prev">
            <Link href={`?page=${page - 1}`}>
              <Button variant="ghost">
                <ChevronsLeft />
              </Button>
            </Link>
          </li>
        )}

        {/* Page Numbers with Ellipsis */}
        {pageNumbers.map((p, index) =>
          p === "..." ? (
            <li
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </li>
          ) : (
            <li key={`page-${p}`}>
              <Link href={`?page=${p}`}>
                <Button variant={page === p ? "secondary" : "ghost"}>
                  {p}
                </Button>
              </Link>
            </li>
          )
        )}

        {/* Next Button */}
        {page < totalPages && (
          <li key="next">
            <Link href={`?page=${page + 1}`}>
              <Button variant="ghost">
                <ChevronsRight />
              </Button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
