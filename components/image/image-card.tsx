"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { ImageType } from "@/src/types/image";
import { Download, ZoomIn } from "lucide-react";

dayjs.extend(relativeTime);

export default function ImageCard({ image }: { image: ImageType }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
      {/* Skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      <Image
        src={image.url}
        alt={image.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className={"object-cover transition-transform duration-300 group-hover:scale-105"}
        onLoadingComplete={() => setLoaded(true)}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">{image.name}</p>
          <p className="text-white/70 text-xs mt-1">{dayjs(image.createdAt).fromNow()}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-2">
          <a
            href={image.url}
            download
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            aria-label="Download image"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            aria-label="View image"
            onClick={() => window.open(image.url, "_blank")}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
