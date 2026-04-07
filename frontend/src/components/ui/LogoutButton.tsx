import { axiosPrivate, setAccessToken } from "@/api/axios";
import { Button } from "./button";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

function LogoutButton() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await axiosPrivate.get("/auth/logout");

      setAccessToken(null);
      setAuth({});
      navigate("/");
    } catch (error) {
      console.error(error);
      navigate("/error", {
        state: { error: "Logout failed. Please try again." },
      });
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant={"outline"}
      className="mx-auto flex w-36"
    >
      <LogOut />
      Log out
    </Button>
  );
}

export default LogoutButton;
