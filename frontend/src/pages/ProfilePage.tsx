import ProfileHeader from "@/components/user_components/ProfileHeader";
import ProfileTabs from "@/components/user_components/ProfileTabs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { User } from "@/types/user";
import { axiosPrivate } from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import type { AxiosError } from "axios";

function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const onUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);

    if (auth.user && auth.user.id === updatedUser.id) {
      setAuth((prev) => {
        return { ...prev, user: updatedUser };
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrivate.get(`/profile/${params.username}`);

        setUser(response.data);
      } catch (error) {
        console.error(error);
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          navigate("/error", {
            state: { error: "User not found." },
          });
        }
      }
    };

    fetchData();
  }, [params.username, navigate]);

  if (!user) return null;

  return (
    <div>
      <ProfileHeader user={user} onUserUpdate={onUserUpdate} />
      <ProfileTabs userId={user.id} />
    </div>
  );
}

export default ProfilePage;
