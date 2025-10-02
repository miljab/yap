import { Button } from "./ui/button";
import GoogleLogo from "../assets/google-logo.svg?react";
import XLogo from "../assets/x-logo.svg?react";
import GithubLogo from "../assets/github-logo.svg?react";

function OAuthButtons() {
  return (
    <div className="flex flex-col gap-2">
      <Button>
        <GoogleLogo className="w-4 h-4" /> Continue with Google
      </Button>

      <Button>
        <GithubLogo className="w-4 h-4" />
        Continue with Github
      </Button>

      <Button>
        <XLogo className="w-4 h-4" />
        Continue with X
      </Button>
    </div>
  );
}

export default OAuthButtons;
