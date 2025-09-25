import axios from "@/api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      const response = await axios.get("/auth/refresh", {
        withCredentials: true,
      });

      setAuth((prev) => {
        return {
          ...prev,
          accessToken: response.data.accessToken,
        };
      });

      return response.data.accessToken;
    } catch (error) {
      console.error("Refresh token failed: ", error);
      setAuth({});
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
