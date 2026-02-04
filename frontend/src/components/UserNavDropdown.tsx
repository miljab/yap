import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user_components/UserAvatar";
import useAuth from "@/hooks/useAuth";
import { ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import useTheme from "@/hooks/useTheme";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";

function UserNavDropdown() {
  const axiosPrivate = useAxiosPrivate();
  const { setAuth } = useAuth();
  const user = useAuthenticatedUser();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await axiosPrivate.get("/auth/logout");

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative cursor-pointer rounded-full">
          <UserAvatar avatarUrl={user.avatar} username={user.username} />
          <div className="bg-accent border-primary absolute -right-1 -bottom-1 rounded-full border">
            <ChevronDown size={16} />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-[200px]">
        <DropdownMenuLabel className="border-input flex justify-center border-b">
          <span className="truncate">{user.username}</span>
        </DropdownMenuLabel>

        <DropdownMenuItem>
          <Link
            to={`/profile/${user.username}`}
            className="flex items-center justify-start gap-1"
          >
            <User />
            Go to your profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center justify-start gap-1"
          onClick={() =>
            theme === "dark" ? setTheme("light") : setTheme("dark")
          }
        >
          {theme === "dark" ? <Moon /> : <Sun />}
          Toggle theme
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center justify-start gap-1"
          onClick={handleLogout}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserNavDropdown;
