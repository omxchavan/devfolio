"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCarouselProps {
  images: string[];
  title: string;
  aspectRatio?: string;
  className?: string;
  showArrows?: boolean;
}

export function ProjectCarousel({
  images,
  title,
  aspectRatio = "aspect-video",
  className,
  showArrows = true,
}: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/30", aspectRatio, className)}>
        <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
      </div>
    );
  }

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * index;
    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % images.length;
    scrollToIndex(nextIndex);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    scrollToIndex(prevIndex);
  };

  const onScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Improved transformation: use pad instead of fill to ensure full visibility
  const transformImage = (url: string) => {
    if (url.includes("cloudinary.com")) {
      // Use b_auto,c_pad to ensure the entire image is visible without cropping
      return url.replace(
        "/upload/",
        `/upload/b_auto:border,c_pad,ar_${aspectRatio.includes("video") ? "1.77" : "1.6"},w_1200,q_auto,f_auto/`
      );
    }
    return url;
  };

  return (
    <div className={cn("group relative overflow-hidden bg-muted/30", aspectRatio, className)}>
      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
      >
        {images.map((img, i) => (
          <div
            key={`${img}-${i}`}
            className="h-full w-full flex-shrink-0 snap-center select-none flex items-center justify-center"
          >
            <img
              src={transformImage(img)}
              alt={`${title} - image ${i + 1}`}
              className="h-full w-full object-contain pointer-events-none"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm border border-border/50 hover:bg-background shadow-lg z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm border border-border/50 hover:bg-background shadow-lg z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 px-2 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollToIndex(i);
              }}
              className={cn(
                "h-1.5 transition-all duration-300 rounded-full",
                currentIndex === i 
                  ? "w-4 bg-white" 
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
