import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

type FollowButtonProps = {
  initialIsFollowed: boolean;
  userId: string;
  onFollowChange?: (isFollowed: boolean) => void;
};

function FollowButton({
  initialIsFollowed,
  userId,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleFollow = async () => {
    setIsSubmiting(true);
    setIsFollowed((prev) => !prev);

    try {
      const response = await axiosPrivate.put(`/users/${userId}/follow`);

      setIsFollowed(response.data.isFollowed);

      if (onFollowChange) onFollowChange(response.data.isFollowed);
    } catch (error) {
      console.error(error);
      setIsFollowed((prev) => !prev);
      toast.error("Failed to change follow status.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Button
      disabled={isSubmiting}
      onClick={handleFollow}
      variant={isFollowed ? "outline" : "default"}
      className="w-24"
    >
      {isFollowed ? "Followed" : "Follow"}
    </Button>
  );
}

export default FollowButton;
