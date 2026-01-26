import React from "react";
import { getImageFromDb } from "@/src/services/image.service";

import Image from "next/image";
import ImageEditButtons from "@/components/image/image-edit-buttons";

// ✅ Next 15 中 PageProps 的 params 可能是 Promise，需要这样写
interface ImagePageProps {
  params: Promise<{
    _id: string;
  }>;
}

export default async function ImagePage({ params }: ImagePageProps) {
  // ✅ 先解析 Promise
  const { _id } = await params;

  // ✅ 用解析出的 _id 调数据库
  const image = await getImageFromDb(_id);

  return (
    <div className="flex flex-col max-w-4xl mx-auto justify-center items-center p-4">
      <div className="relative w-full h-[60vh] mb-8">
        <Image
          src={image.url}
          alt={image.name}
          fill
          className="rounded-lg object-contain"
        />
      </div>

      <div>
        <ImageEditButtons image={image} />
      </div>
    </div>
  );
}
