import type { Image } from "@/types/post";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

type ImagePreviewProps = {
  images: Image[];
};

function ImagePreview({ images }: ImagePreviewProps) {
  const [showCarousel, setShowCarousel] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleImageClick(idx: number) {
    setActiveIndex(idx);
    setShowCarousel(true);
  }

  function handleClose() {
    setShowCarousel(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((image, idx) => (
          <img
            key={idx}
            src={image.url}
            className="h-40 w-40 cursor-pointer rounded-md object-cover"
            onClick={() => handleImageClick(idx)}
          />
        ))}
      </div>
      {showCarousel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <button
            className="absolute top-4 right-4 text-2xl text-white"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
          <Carousel className="w-full max-w-xl">
            <CarouselContent>
              {images.map((image, idx) => (
                <CarouselItem key={idx}>
                  <img
                    src={image.url}
                    className="max-h-xl max-w-xl rounded-md object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
    </div>
  );
}

export default ImagePreview;
