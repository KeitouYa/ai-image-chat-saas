import React from "react";

import { getUserImagesFromDb } from "@/src/services/image.service";

import { ImageType } from "@/src/types/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ImageCard from "@/components/image/image-card";
import Pagination from "@/components/layout/pagination";

dayjs.extend(relativeTime);

// ✅ Next 15：searchParams 可能是 Promise，需要这样声明
interface DashboardProps {
  searchParams: Promise<{
    page?: string; // URL 查询参数是字符串
  }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  console.log("✅NEXT_RUNTIME =", process.env.NEXT_RUNTIME); //
  const { page } = await searchParams;

  // ✅ 安全把字符串转为数字，默认 1
  const pageNum =
    Number.isFinite(Number(page)) && Number(page) > 0
      ? Math.floor(Number(page))
      : 1;

  const limit = 6; // images per page
  const { images, totalCount } = await getUserImagesFromDb(pageNum, limit);
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-8">
      {/* Image grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image: ImageType) => (
          <Link key={image._id} href={`/dashboard/image/${image._id}`}>
            <ImageCard image={image} />
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Pagination page={pageNum} totalPages={totalPages} />
      </div>
    </div>
  );
}
