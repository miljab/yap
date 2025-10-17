import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "./button";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";

function LogoutButton() {
  const axiosPrivate = useAxiosPrivate();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await axiosPrivate.get("/auth/logout");

    setAuth({});
    navigate("/");
  }
  return (
    <Button onClick={handleLogout} variant={"outline"} className="px-2 md:px-4">
      Log out
    </Button>
  );
}

export default LogoutButton;
