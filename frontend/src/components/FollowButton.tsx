import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

type FollowButtonProps = {
  initialIsFollowed: boolean;
  userId: string;
};

function FollowButton({ initialIsFollowed, userId }: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const axiosPrivate = useAxiosPrivate();

  const handleFollow = async () => {
    try {
      const response = await axiosPrivate.put(`/users/${userId}/follow`);

      setIsFollowed(response.data.isFollowed);
    } catch (error) {
      console.error(error);
      toast.error("Failed to change follow status.");
    }
  };

  return (
    <Button
      onClick={handleFollow}
      variant={isFollowed ? "outline" : "default"}
      className="w-24"
    >
      {isFollowed ? "Followed" : "Follow"}
    </Button>
  );
}

export default FollowButton;
