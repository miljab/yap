import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import defaultAvatar from "@/assets/default-avatar.png";
import useAuth from "@/hooks/useAuth";
import { ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import useTheme from "@/hooks/useTheme";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

function UserNavDropdown() {
  const axiosPrivate = useAxiosPrivate();
  const { auth, setAuth } = useAuth();
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
          <Avatar>
            <AvatarImage src={auth.user?.avatar} />
            <AvatarFallback>
              <img src={defaultAvatar} alt="avatar" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-accent border-primary absolute -right-1 -bottom-1 rounded-full border">
            <ChevronDown size={16} />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="border-input flex justify-center border-b">
          {auth.user?.username}
        </DropdownMenuLabel>

        <DropdownMenuItem>
          <Link
            to={`/user/${auth.user?.username}`}
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
