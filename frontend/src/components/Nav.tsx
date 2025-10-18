import useAuth from "@/hooks/useAuth";
import { Bell, House, Search } from "lucide-react";
import { Link } from "react-router";
import UserNavDropdown from "./UserNavDropdown";

function Nav() {
  const { auth } = useAuth();

  return (
    <div className="border-input flex h-full w-full items-center justify-around gap-4 border-b p-2 md:min-h-screen md:flex-col">
      <Link to="/home" className="flex items-center justify-center gap-2">
        <House />
        <span className="hidden md:block">Home</span>
      </Link>

      <Link to="/search" className="flex items-center justify-center gap-2">
        <Search />
        <span className="hidden md:block">Search</span>
      </Link>

      <Link to="/search" className="flex items-center justify-center gap-2">
        <Bell />
        <span className="hidden md:block">Notifications</span>
      </Link>

      <div className="flex items-center gap-2">
        <UserNavDropdown />

        <span className="hidden md:block">{auth.user?.username}</span>
      </div>
    </div>
  );
}

export default Nav;
