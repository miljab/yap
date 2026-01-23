import { Button } from "../ui/button";
import GoogleLogo from "../assets/google-logo.svg?react";
import GithubLogo from "../assets/github-logo.svg?react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useTheme from "@/hooks/useTheme";

function OAuthButtons() {
  const { theme } = useTheme();

  function handleClick(provider: string) {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/${provider}`;
  }

  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="grow"
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => handleClick("google")}
          >
            <GoogleLogo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue with Google</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="grow"
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => handleClick("github")}
          >
            <GithubLogo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Continue with Github</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default OAuthButtons;
