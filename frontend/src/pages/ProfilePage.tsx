import ProfileHeader from "@/components/user_components/ProfileHeader";
import ProfileFeed from "@/components/user_components/ProfileFeed";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { User } from "@/types/user";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrivate.get(`/profile/${params.username}`);

        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [axiosPrivate, params.username]);

  if (!user) return null;

  return (
    <div>
      <ProfileHeader user={user} onUserUpdate={setUser} />
      <ProfileFeed userId={user.id} />
    </div>
  );
}

export default ProfilePage;
