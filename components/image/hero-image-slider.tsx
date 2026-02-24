"use client";
import React from "react";
import Image from "next/image";

const thumbnails = [
  "/images/mountain.jpg",
  "/images/city.jpg",
  "/images/desert.jpg",
  "/images/space.jpg",
];

export function HeroImageSlider() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Auto slide every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thumbnails.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[40vh] p-8 max-w-4xl mx-auto">
      {/* Pre-render all images, toggle visibility with opacity */}
      {thumbnails.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="ai image generator"
          fill
          className={`rounded-[20px] object-cover transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          priority={index === 0}
        />
      ))}
      <ThumbnailRow
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
}

interface ThumbnailRowProps {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const ThumbnailRow = ({ currentIndex, setCurrentIndex }: ThumbnailRowProps) => {
  return (
    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-[20px] shadow-lg w-auto max-w-full space-x-5 overflow-x-auto">
      {thumbnails.map((src, index) => (
        <div
          key={src}
          className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[20px] overflow-hidden shadow-md transition-transform transform hover:scale-105 flex-shrink-0 cursor-pointer ${
            index === currentIndex ? "ring-2 ring-purple-500" : ""
          }`}
          onClick={() => setCurrentIndex(index)}
        >
          <Image
            src={src}
            alt={`Thumbnail ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};
