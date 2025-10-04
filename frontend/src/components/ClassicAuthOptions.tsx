import { Link } from "react-router";
import { Button } from "./ui/button";
import useTheme from "@/hooks/useTheme";

function ClassicAuthOptions() {
  const { theme } = useTheme();

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
      >
        Demo user
      </Button>
    </div>
  );
}

export default ClassicAuthOptions;
