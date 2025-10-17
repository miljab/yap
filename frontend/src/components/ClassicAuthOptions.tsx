import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import useTheme from "@/hooks/useTheme";
import useAuth from "@/hooks/useAuth";
import axios from "@/api/axios";

function ClassicAuthOptions() {
  const { theme } = useTheme();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleDemoUserLogin = async () => {
    try {
      const response = await axios.get("/auth/demo", {
        withCredentials: true,
      });

      const user = response.data.user;
      const accessToken = response.data.accessToken;

      setAuth({ user, accessToken });
      navigate("/");
    } catch (error) {
      console.error(error);
      navigate("/error", {
        state: { error: "Failed to log in with demo user. Please try again." },
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 font-[Roboto_Mono]">
      <Button
        asChild
        className="px-8"
        variant={theme === "dark" ? "default" : "outline"}
      >
        <Link to="/login">Log in with email</Link>
      </Button>
      <Button
        asChild
        className="px-8"
        variant={theme === "dark" ? "default" : "outline"}
      >
        <Link to="/signup">Create account</Link>
      </Button>
      <Button
        className="px-8"
        variant={theme === "dark" ? "default" : "outline"}
        onClick={handleDemoUserLogin}
      >
        Demo user
      </Button>
    </div>
  );
}

export default ClassicAuthOptions;
