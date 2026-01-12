import { useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

type UseLikeProps = {
  itemId: string;
  itemType: "post" | "comment";
  initialIsLiked: boolean;
  initialLikeCount: number;
};

export function useLike({
  itemId,
  itemType,
  initialIsLiked,
  initialLikeCount,
}: UseLikeProps) {
  const [isLiking, setLiking] = useState(false);
  const [isLiked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const axiosPrivate = useAxiosPrivate();

  async function handleLike() {
    if (isLiking) return;

    setLiking(true);
    const prevLiked = isLiked;
    const prevLikeCount = likeCount;

    if (isLiked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }

    try {
      const { data } = await axiosPrivate.post(`/${itemType}/${itemId}/like`);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error(error);

      toast.error(
        prevLiked
          ? `Failed to dislike ${itemType}. Please try again.`
          : `Failed to like ${itemType}. Please try again.`,
      );

      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
    } finally {
      setLiking(false);
    }
  }

  return {
    isLiked,
    likeCount,
    isLiking,
    handleLike,
  };
}
