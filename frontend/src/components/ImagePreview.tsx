import type { Image } from "@/types/post";

type ImagePreviewProps = {
  images: Image[];
};

function ImagePreview({ images }: ImagePreviewProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((image, idx) => (
        <img
          key={idx}
          src={image.url}
          className="h-40 w-40 rounded-md object-cover"
        />
      ))}
    </div>
  );
}

export default ImagePreview;
