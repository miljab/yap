import useAuth from "@/hooks/useAuth";
import { Bell, House, Search } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import defaultAvatar from "../assets/default-avatar.png";
import LogoutButton from "./ui/LogoutButton";
import ToggleTheme from "./ui/ToggleTheme";

function Nav() {
  const { auth } = useAuth();

  return (
    <div className="flex h-full items-center gap-4 md:flex-col">
      <div className="flex items-center gap-4 md:flex-col">
        <Link to="/home" className="flex items-center justify-center">
          <House />
          <span className="hidden md:block">Home</span>
        </Link>

        <Link to="/search" className="flex items-center justify-center">
          <Search />
          <span className="hidden md:block">Search</span>
        </Link>

        <Link to="/search" className="flex items-center justify-center">
          <Bell />
          <span className="hidden md:block">Notifications</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:flex-col">
        <Link
          to={`/user/${auth.user?.username}`}
          className="hover:bg-accent flex items-center gap-2 rounded-full p-1"
        >
          <Avatar>
            <AvatarImage src={auth.user?.avatar} />
            <AvatarFallback>
              <img src={defaultAvatar} alt="avatar" />
            </AvatarFallback>
          </Avatar>

          <span className="hidden md:block">{auth.user?.username}</span>
        </Link>

        <LogoutButton />
      </div>

      <ToggleTheme />
    </div>
  );
}

export default Nav;
