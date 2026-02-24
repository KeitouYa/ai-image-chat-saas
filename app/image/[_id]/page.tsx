import React from "react";
import { getImageFromDb } from "@/src/services/image.service";
import Image from "next/image";
import ImageCard from "@/components/image/image-card";

// ✅ 在 Next 15 中，PageProps 的 params 可能是 Promise，需要显式声明
interface ImagePageProps {
  params: Promise<{
    _id: string;
  }>;
}

export default async function ImagePage({ params }: ImagePageProps) {
  // ✅ 等待 Promise 解析
  const { _id } = await params;

  // ✅ 使用解析后的 _id 访问数据库
  const image = await getImageFromDb(_id);

  return (
    <div>
      <div className="flex flex-row justify-center mt-20">
        <ImageCard image={image} />
      </div>

      <div className="flex flex-row justify-center items-center">
        <div className="relative w-full h-[75vh] my-20">
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}
