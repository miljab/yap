import { Bell, House, Search } from "lucide-react";
import { Link } from "react-router";
import UserNavDropdown from "./UserNavDropdown";
import LogoutButton from "./ui/LogoutButton";
import ToggleTheme from "./ui/ToggleTheme";
import UserAvatar from "./user_components/UserAvatar";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";

function Nav() {
  const user = useAuthenticatedUser();

  return (
    <div className="md:flex md:w-full md:grow md:justify-end">
      <nav className="border-input flex h-full w-full items-center justify-around border-b p-2 md:min-h-screen md:max-w-[250px] md:grow md:flex-col md:items-start md:justify-center md:border-r md:border-b-0">
        <h1 className="hidden p-4 text-4xl tracking-wider md:mx-auto md:mb-24 md:block md:text-center">
          <Link to="/home">yap.</Link>
        </h1>

        <div className="flex h-full w-full items-center justify-around gap-4 p-2 md:grow md:flex-col md:items-start md:justify-start md:text-xl">
          <Link
            to="/home"
            className="hover:bg-accent flex items-center justify-center gap-2 rounded-full p-2 md:w-full md:justify-start"
          >
            <House />
            <span className="hidden font-[Roboto_Mono] md:block">Home</span>
          </Link>

          <Link
            to="/search"
            className="hover:bg-accent flex items-center justify-center gap-2 rounded-full p-2 md:w-full md:justify-start"
          >
            <Search />
            <span className="hidden font-[Roboto_Mono] md:block">Search</span>
          </Link>

          <Link
            to="/search"
            className="hover:bg-accent flex items-center justify-center gap-2 rounded-full p-2 md:w-full md:justify-start"
          >
            <Bell />
            <span className="hidden font-[Roboto_Mono] md:block">
              Notifications
            </span>
          </Link>

          <div className="flex h-full items-center justify-center md:hidden">
            <UserNavDropdown />
          </div>
        </div>

        <div className="md:border-input hidden px-4 py-4 md:mx-auto md:flex md:max-w-full md:flex-col md:gap-4 md:rounded-md md:border md:shadow-xs">
          <Link
            to={`/profile/${user.username}`}
            className="hover:bg-accent flex items-center justify-center gap-2 rounded-full p-2"
          >
            <UserAvatar avatarUrl={user.avatar} username={user.username} />
            <span className="truncate">{user.username}</span>
          </Link>

          <LogoutButton />
        </div>

        <div className="hidden w-full md:mt-8 md:flex md:items-center md:justify-center">
          <ToggleTheme />
        </div>
      </nav>
    </div>
  );
}

export default Nav;
