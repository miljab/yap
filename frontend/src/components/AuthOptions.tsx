import ClassicAuthOptions from "./ClassicAuthOptions";
import OAuthButtons from "./OAuthButtons";
import Divider from "./ui/Divider";

function AuthOptions() {
  return (
    <div className="flex flex-col gap-2">
      <OAuthButtons />
      <Divider />
      <ClassicAuthOptions />
    </div>
  );
}

export default AuthOptions;
