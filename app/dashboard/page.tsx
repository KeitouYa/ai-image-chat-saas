import React from "react";

import { getUserImagesFromDb } from "@/src/services/image.service";

import { ImageType } from "@/src/types/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ImageCard from "@/components/cards/image-card";
import Pagination from "@/components/nav/pagination";

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
    <div>
      <div className="p-5 text-center">
        <h1 className="text-2xl font-bold text-center">Images</h1>
        <p>Your AI-Generated Image Collection</p>
      </div>

      {/* ⬇️ 修复了 className 的小拼写：md:grid-cols-2 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((image: ImageType) => (
          <Link key={image._id} href={`/dashboard/image/${image._id}`}>
            <ImageCard image={image} />
          </Link>
        ))}
      </div>

      <div className="flex justify-center m-20">
        <Pagination page={pageNum} totalPages={totalPages} />
      </div>
    </div>
  );
}
