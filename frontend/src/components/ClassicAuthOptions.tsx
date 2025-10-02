import { Link } from "react-router";
import { Button } from "./ui/button";

function ClassicAuthOptions() {
  return (
    <div className="flex flex-col gap-2 font-[Roboto_Mono]">
      <Button asChild className="px-8">
        <Link to="/login">Log in with email</Link>
      </Button>
      <Button asChild className="px-8">
        <Link to="/signup">Create account</Link>
      </Button>
      <Button className="px-8">Demo user</Button>
    </div>
  );
}

export default ClassicAuthOptions;
