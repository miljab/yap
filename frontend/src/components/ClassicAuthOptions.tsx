import { Button } from "./ui/button";
function ClassicAuthOptions() {
  return (
    <div className="flex flex-col gap-2">
      <Button>Continue with email</Button>
      <Button>Sign up</Button>
      <Button>Demo user</Button>
    </div>
  );
}

export default ClassicAuthOptions;
