import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { ImageType } from "@/src/types/image";

dayjs.extend(relativeTime);

export default function ImageCard({ image }: { image: ImageType }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
      <Image
        src={image.url}
        alt={image.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
        <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">
            {image.name}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {dayjs(image.createdAt).fromNow()}
          </p>
        </div>
      </div>
    </div>
  );
}
