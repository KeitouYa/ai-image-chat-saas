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
  const [currentImage, setCurrentImage] = React.useState(thumbnails[0]);
  //auto slide every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => {
        const currentIndex = thumbnails.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % thumbnails.length;
        return thumbnails[nextIndex];
      });
    }, 2000);
    //cleanup
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full h-[40vh] p-8 max-w-4xl mx-auto">
      <Image
        src={currentImage}
        alt="ai image generator"
        fill
        objectFit="cover"
        className="rounded-[20px]"
        priority
      />
      <ThumbnailRow
        currentImage={currentImage}
        setCurrentImage={setCurrentImage}
      />
    </div>
  );
}

interface ThumbnailRowProps {
  currentImage: string;
  setCurrentImage: React.Dispatch<React.SetStateAction<string>>;
}

const ThumbnailRow = ({ currentImage, setCurrentImage }: ThumbnailRowProps) => {
  return (
    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex bg-slate-100 bg-opacity-50 p-4 rounded-[20px] shadow-lg w-auto max-w-full space-x-5 overflow-x-auto">
      {thumbnails.map((src, index) => (
        <div
          key={index}
          className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[20px] overflow-hidden shadow-md transition-transform transform hover:scale-105 flex-shrink-0 cursor-pointer"
          onClick={() => setCurrentImage(src)}
        >
          <Image
            src={src}
            alt={`Thumbnail ${index + 1}`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      ))}
    </div>
  );
};
