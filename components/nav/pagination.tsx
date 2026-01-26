import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronsRight, ChevronsLeft } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  return (
    <nav className="flex justify-center fixed-bottom opacity-75 mb-10">
      <ul className="flex justify-center items-center space-x-2 mt-5">
        {/* Previous Button */}
        {page > 1 && (
          <li key={`prev-${page}`}>
            <Link href={`?page=${page - 1}`}>
              <Button variant="ghost">
                <ChevronsLeft />
              </Button>
            </Link>
          </li>
        )}

        {/* Numbered Page Buttons */}
        {Array.from({ length: totalPages }, (_, i) => {
          const p = i + 1;
          return (
            <li key={`page-${p}`}>
              <Link href={`?page=${p}`}>
                <Button variant={page === p ? "secondary" : "ghost"}>
                  {p}
                </Button>
              </Link>
            </li>
          );
        })}

        {/* Next Button */}
        {page < totalPages && (
          <li key={`next-${page}`}>
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
